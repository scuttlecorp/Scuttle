import { Octokit } from "@octokit/rest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

interface FileTree {
  path: string;
  mode: '100644' | '100755' | '040000';
  type: 'blob' | 'tree';
  sha?: string;
}

// Get all files in a directory recursively
function getAllFiles(dir: string, baseDir: string = dir, ignore: string[] = []): string[] {
  const files: string[] = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const relativePath = fullPath.replace(baseDir + '/', '');

    // Skip ignored paths
    if (ignore.some(pattern => relativePath.includes(pattern))) {
      continue;
    }

    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir, ignore));
    } else {
      files.push(relativePath);
    }
  }

  return files;
}

export async function syncToGitHub(commitMessage: string): Promise<void> {
  try {
    const octokit = await getUncachableGitHubClient();
    
    const owner = 'scuttlecorp';
    const repo = 'Scuttle';
    const branch = 'main';

    // Get current commit SHA
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });

    const commitSha = ref.object.sha;

    // Get current commit to get tree
    const { data: commit } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: commitSha,
    });

    const baseTreeSha = commit.tree.sha;

    // Get all files to sync (excluding node_modules, .git, etc.)
    const baseDir = process.cwd();
    const ignore = ['node_modules', '.git', 'dist', '.replit', '.config', '.cache', 'attached_assets', 'tmp'];
    const files = getAllFiles(baseDir, baseDir, ignore);

    // Create blobs for each file
    const tree: FileTree[] = [];
    
    for (const file of files) {
      try {
        const content = readFileSync(join(baseDir, file));
        const { data: blob } = await octokit.git.createBlob({
          owner,
          repo,
          content: content.toString('base64'),
          encoding: 'base64',
        });

        tree.push({
          path: file,
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        });
      } catch (error) {
        console.error(`[GitHub Sync] Failed to create blob for ${file}:`, error);
      }
    }

    // Create new tree
    const { data: newTree } = await octokit.git.createTree({
      owner,
      repo,
      tree,
      base_tree: baseTreeSha,
    });

    // Create new commit
    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTree.sha,
      parents: [commitSha],
    });

    // Update reference
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });

    console.log(`[GitHub Sync] ✓ Successfully synced to GitHub: ${commitMessage}`);
  } catch (error: any) {
    console.error('[GitHub Sync] ✗ Failed:', error.message);
    throw error;
  }
}

// Debounced sync to avoid too many commits
let syncTimeout: NodeJS.Timeout | null = null;
let pendingMessage: string = '';

export function debouncedGitHubSync(message: string, delay: number = 30000): void {
  pendingMessage = message;
  
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    try {
      await syncToGitHub(pendingMessage);
      pendingMessage = '';
    } catch (error) {
      console.error('[GitHub Sync] Debounced sync failed:', error);
    }
  }, delay);
}

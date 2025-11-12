import { HeroSection } from '@/components/hero-section';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EncryptionBadge } from '@/components/encryption-badge';
import { useQuery } from '@tanstack/react-query';
import { Coins, TrendingUp, Activity, DollarSign, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { type Token, type Presale, type DashboardStats } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/stats'],
  });

  const { data: recentTokens, isLoading: tokensLoading } = useQuery<Token[]>({
    queryKey: ['/api/tokens/recent'],
  });

  const { data: activePresales, isLoading: presalesLoading } = useQuery<Presale[]>({
    queryKey: ['/api/presales/active'],
  });

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Stats Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Platform Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Tokens"
              value={stats?.totalTokens || 0}
              icon={Coins}
              isLoading={statsLoading}
            />
            <StatCard
              title="Active Presales"
              value={stats?.activePresales || 0}
              icon={TrendingUp}
              isLoading={statsLoading}
            />
            <StatCard
              title="Total Transactions"
              value={stats?.totalTransactions || 0}
              icon={Activity}
              isLoading={statsLoading}
            />
            <StatCard
              title="Total Value Locked"
              value={stats?.totalValueLocked ? `${stats.totalValueLocked} ETH` : '0 ETH'}
              icon={DollarSign}
              isLoading={statsLoading}
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all group">
              <Link href="/create-token">
                <a className="block p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Create New Token</h3>
                  <p className="text-muted-foreground">
                    Launch a confidential ERC-20 token with encrypted balances using FHEVM
                  </p>
                </a>
              </Link>
            </Card>

            <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all group">
              <Link href="/presales">
                <a className="block p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Launch Presale</h3>
                  <p className="text-muted-foreground">
                    Create a confidential presale with encrypted contribution tracking
                  </p>
                </a>
              </Link>
            </Card>
          </div>
        </section>

        {/* Recent Tokens */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Tokens</h2>
            <Link href="/tokens">
              <Button variant="ghost" className="gap-2" data-testid="button-view-all-tokens">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {tokensLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentTokens && recentTokens.length > 0 ? (
            <div className="space-y-4">
              {recentTokens.map((token) => (
                <Card key={token.id} className="hover-elevate transition-all" data-testid={`token-card-${token.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{token.name}</h3>
                          <span className="text-sm text-muted-foreground font-mono">{token.symbol}</span>
                          <EncryptionBadge status={token.isEncrypted ? 'encrypted' : 'public'} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Supply: {Number(token.totalSupply).toLocaleString()} {token.symbol}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">{token.status}</div>
                        {token.contractAddress && (
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}
                          </code>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No tokens created yet</h3>
                <p className="text-muted-foreground mb-4">Get started by creating your first confidential token</p>
                <Link href="/create-token">
                  <Button data-testid="button-create-first-token">Create Token</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Active Presales */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Active Presales</h2>
            <Link href="/presales">
              <Button variant="ghost" className="gap-2" data-testid="button-view-all-presales">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {presalesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-2 w-full mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activePresales && activePresales.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePresales.map((presale) => (
                <Card key={presale.id} className="hover-elevate transition-all" data-testid={`presale-card-${presale.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{presale.tokenName}</CardTitle>
                      <EncryptionBadge status={presale.isEncrypted ? 'encrypted' : 'public'} />
                    </div>
                    <CardDescription className="font-mono">{presale.tokenSymbol}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {((Number(presale.totalRaised) / Number(presale.hardCap)) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: `${Math.min((Number(presale.totalRaised) / Number(presale.hardCap)) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Raised</div>
                          <div className="font-medium">{presale.totalRaised} ETH</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Participants</div>
                          <div className="font-medium">{presale.participantCount}</div>
                        </div>
                      </div>
                      <Link href={`/presales/${presale.id}`}>
                        <Button className="w-full" variant="outline" data-testid={`button-view-presale-${presale.id}`}>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No active presales</h3>
                <p className="text-muted-foreground mb-4">Launch a presale to start raising funds</p>
                <Link href="/presales">
                  <Button data-testid="button-launch-first-presale">Launch Presale</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

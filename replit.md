# Scuttle Social - Confidential Token & Presale Platform

## Overview
Scuttle Social is a decentralized application (dApp) for creating and managing confidential token presales using Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine) protocol. The platform enables privacy-preserving ERC-20 tokens where balances and transfer amounts remain encrypted on-chain.

## Project Architecture

### Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js with TypeScript
- **Styling**: Tailwind CSS + Shadcn UI components
- **State Management**: TanStack Query (React Query)
- **Web3**: Custom wallet integration (extensible to ethers.js/wagmi)
- **Blockchain**: FHEVM Protocol (Zama)
- **Database**: In-memory storage (extensible to PostgreSQL)
- **Version Control**: GitHub auto-sync integration

### Key Features
1. **Confidential Token Creation**: Multi-step wizard to deploy ERC-20 tokens with encrypted balances
2. **Presale Management**: Launch and manage token presales with encrypted contributions
3. **Wallet Integration**: Connect Web3 wallets with network detection
4. **Dashboard Analytics**: Real-time statistics and activity monitoring
5. **GitHub Integration**: Automatic code synchronization to repository

## Directory Structure

```
├── client/
│   ├── public/
│   │   ├── scuttle-logo.jpg          # Platform logo
│   │   └── favicon.png
│   └── src/
│       ├── components/
│       │   ├── ui/                   # Shadcn components
│       │   ├── navigation.tsx        # Top navigation bar
│       │   ├── wallet-button.tsx     # Wallet connection component
│       │   ├── theme-toggle.tsx      # Dark/light mode toggle
│       │   ├── encryption-badge.tsx  # FHE status indicator
│       │   ├── hero-section.tsx      # Landing hero
│       │   └── stat-card.tsx         # Dashboard statistics
│       ├── pages/
│       │   ├── dashboard.tsx         # Main dashboard
│       │   ├── create-token.tsx      # Token creation wizard
│       │   ├── presales.tsx          # Presale listings
│       │   └── not-found.tsx         # 404 page
│       ├── hooks/
│       │   ├── use-wallet.ts         # Wallet state management
│       │   ├── use-theme.ts          # Theme management
│       │   └── use-toast.ts          # Toast notifications
│       ├── lib/
│       │   ├── web3.ts               # Web3 utilities
│       │   ├── queryClient.ts        # API client
│       │   └── utils.ts              # Helper functions
│       ├── App.tsx                   # Main app component
│       ├── index.css                 # Global styles
│       └── main.tsx                  # Entry point
├── server/
│   ├── index.ts                      # Server entry
│   ├── routes.ts                     # API routes
│   ├── storage.ts                    # Data persistence layer
│   └── vite.ts                       # Vite dev server config
├── shared/
│   └── schema.ts                     # Shared TypeScript types & Zod schemas
└── design_guidelines.md              # UI/UX design specifications

```

## Data Models

### Token
- **id**: Unique identifier
- **name**: Token name (e.g., "My Token")
- **symbol**: Ticker symbol (e.g., "MTK")
- **totalSupply**: Total token supply
- **isEncrypted**: Whether balances are encrypted
- **contractAddress**: Deployed contract address
- **creatorAddress**: Wallet address of creator
- **network**: Blockchain network (sepolia, mainnet)
- **status**: draft | deploying | deployed | failed

### Presale
- **id**: Unique identifier
- **tokenId**: Associated token ID
- **tokenName**: Token name
- **tokenSymbol**: Token symbol
- **pricePerToken**: Price in ETH
- **hardCap**: Maximum tokens to sell
- **softCap**: Minimum tokens to sell
- **startDate**: Presale start time
- **endDate**: Presale end time
- **contractAddress**: Presale contract address
- **ownerAddress**: Creator's wallet
- **totalRaised**: ETH raised so far
- **participantCount**: Number of contributors
- **status**: upcoming | active | ended | finalized | cancelled
- **isEncrypted**: Whether contributions are encrypted

### Participant
- **id**: Unique identifier
- **presaleId**: Associated presale ID
- **walletAddress**: Contributor's wallet
- **contributionAmount**: Amount contributed in ETH
- **tokenAmount**: Tokens allocated
- **transactionHash**: Blockchain transaction hash

## API Endpoints

### Tokens
- `GET /api/tokens` - List all tokens
- `GET /api/tokens/recent` - Get recent tokens
- `POST /api/tokens` - Create new token
- `GET /api/tokens/:id` - Get token details
- `PATCH /api/tokens/:id` - Update token status

### Presales
- `GET /api/presales` - List all presales
- `GET /api/presales/active` - Get active presales
- `POST /api/presales` - Create new presale
- `GET /api/presales/:id` - Get presale details
- `POST /api/presales/:id/participate` - Contribute to presale

### Statistics
- `GET /api/stats` - Get platform statistics

## Design System

### Typography
- **Font Family**: Inter (sans-serif), JetBrains Mono (monospace)
- **Headings**: 600-700 weight
- **Body**: 400-500 weight
- **Code/Addresses**: JetBrains Mono

### Colors
- **Primary**: Purple/Blue (262 83% 58%) - Main brand color
- **Accent**: Light purple for secondary elements
- **Success**: Green - Encrypted status
- **Muted**: Gray - Secondary information

### Components
- **Cards**: Rounded (rounded-xl), subtle shadows, hover elevation
- **Buttons**: Multiple variants (default, outline, ghost)
- **Badges**: Status indicators with icons
- **Forms**: Multi-step wizards with progress indicators

### Spacing
- Component padding: p-6 or p-8
- Section spacing: py-12 lg:py-16
- Card gaps: gap-6
- Form fields: space-y-4

## Web3 Integration

### Wallet Manager
- Mock implementation for demo (extensible to real Web3)
- Supports connection/disconnection
- Network switching capability
- Address display and clipboard copy

### FHEVM Integration Points
1. Token deployment with encrypted balances
2. Presale contributions with confidential amounts
3. Access control for decryption
4. FHE computation status tracking

## GitHub Integration

The application automatically syncs code changes to the GitHub repository using the Octokit REST API. Configuration:

- **Repository**: scuttlecorp/Scuttle
- **Connection**: GitHub connector (conn_github_01K9V9BRTEBK4M99G3N7QVM5W6)
- **Auto-sync**: Enabled for all code modifications

## Development

### Running Locally
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run check
```

## Deployment Workflow

1. User connects wallet
2. Creates confidential token via wizard
3. Token deploys to FHEVM network
4. User launches presale with encrypted tracking
5. Participants contribute with private amounts
6. Presale finalizes and distributes tokens
7. All changes auto-sync to GitHub

## User Preferences
- Theme: Supports light/dark mode with system preference detection
- Wallet: Persistent connection state
- Network: Sepolia testnet by default

## Recent Changes
- Initial setup of confidential token platform
- Implemented multi-step token creation wizard
- Built dashboard with real-time statistics
- Created presale management interface
- Added Web3 wallet integration
- Configured GitHub auto-sync
- Established design system with Scuttle Social branding

## Next Steps
1. Implement actual FHEVM smart contract integration
2. Add real wallet provider support (MetaMask, WalletConnect)
3. Build presale participation flow
4. Implement participant dashboard
5. Add transaction history tracking
6. Create admin panel for presale management

# Scuttle Social - Design Guidelines
## Confidential Token & Presale dApp

### Design Approach
**Hybrid Approach**: Combining Web3 platform aesthetics (Uniswap, Aave) with Material Design principles for clarity and trust. The application requires professional credibility for financial operations while maintaining modern crypto-native visual language.

### Core Design Principles
1. **Trust & Security First**: Visual hierarchy emphasizes security features and encryption status
2. **Progressive Disclosure**: Complex blockchain operations broken into clear, guided steps
3. **Data Transparency**: Real-time blockchain state visible but not overwhelming
4. **Crypto-Native**: Familiar Web3 patterns for wallet connection and transaction flows

---

## Typography

**Primary Font**: Inter (Google Fonts)
- Headings: 600-700 weight
- Body: 400-500 weight
- Code/Addresses: JetBrains Mono for wallet addresses and contract data

**Scale**:
- Hero/H1: text-4xl lg:text-5xl
- Section Headers: text-2xl lg:text-3xl
- Card Titles: text-xl
- Body: text-base
- Captions/Labels: text-sm
- Micro (addresses, hashes): text-xs

---

## Layout System

**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16
- Component padding: p-6 or p-8
- Section spacing: py-12 lg:py-16
- Card gaps: gap-6
- Form field spacing: space-y-4

**Container Strategy**:
- App shell: max-w-7xl mx-auto px-4 lg:px-8
- Forms/wizards: max-w-2xl
- Dashboard grids: Full width with constrained inner content

---

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed header with Scuttle Social logo (left)
- Wallet connection button (right) with address truncation
- Network indicator showing FHEVM status
- Glassmorphic background (backdrop-blur-lg) when scrolled

### Hero Section
**Encrypted Platform Hero**:
- Full-width gradient background (NOT an image - use CSS gradients suggesting encryption/security)
- Centered content: H1 headline + subtitle explaining confidential tokens
- Dual CTA: "Create Token" (primary) + "Launch Presale" (secondary)
- Visual element: Animated encryption badge or security shield icon
- Height: min-h-[60vh]

### Cards & Panels
**Primary Card Style**:
- Rounded corners: rounded-xl
- Subtle borders: border border-gray-200/50
- Soft shadows: shadow-lg
- Hover lift: hover:shadow-xl transition
- Internal padding: p-6 or p-8

**Dashboard Cards**:
- Two-column grid (lg:grid-cols-2) for stats
- Three-column grid (lg:grid-cols-3) for presale listings
- Each card shows: encrypted status badge, key metrics, action button

### Forms
**Token Creation Wizard**:
- Multi-step form with progress indicator (steps: Details → Supply → Encryption → Deploy)
- Input fields with labels above, helper text below
- "Encrypted" toggle switches with visual confirmation
- Field grouping with subtle background panels (bg-gray-50)
- Form width: max-w-xl centered

**Input Components**:
- Full-width inputs: w-full
- Height: h-12
- Border: border-2 with focus ring
- Prefix icons for token symbol, supply amounts
- Suffix badges showing "Private" or "Public" status

### Presale Interface
**Presale Configuration Panel**:
- Left sidebar: Configuration form (price, cap, dates)
- Right panel: Live preview of presale page
- Bottom: Deployment status tracker

**Participant Dashboard**:
- Table view with encrypted contribution amounts
- Decryption action buttons for authorized users
- Progress bar showing presale completion percentage
- Real-time participant counter (non-sensitive data)

### Web3 Components
**Wallet Connection**:
- Modal dialog with provider selection (MetaMask, WalletConnect)
- Connected state: Abbreviated address with Jazzicon/Identicon
- Disconnect option in dropdown

**Transaction Status**:
- Toast notifications for pending/success/error states
- Progress spinners during blockchain interactions
- Transaction hash links to block explorer
- FHE computation status indicators

### Badges & Indicators
**Encryption Status Badges**:
- "🔒 Encrypted" badge in green
- "👁️ Public" badge in gray
- "⚙️ Processing FHE" animated badge
- Size: px-3 py-1 text-xs font-medium rounded-full

---

## Page Layouts

### Dashboard (Home)
1. **Stats Row**: 4-column grid showing total tokens created, active presales, total encrypted transactions, TVL
2. **Quick Actions**: Large card grid for "Create Token" and "Launch Presale"
3. **Recent Activity**: Table of user's tokens and presales
4. **Global Activity Feed**: Recent confidential token deployments (encrypted amounts)

### Token Creation Flow
1. **Header**: Progress stepper
2. **Main**: Centered form with current step
3. **Footer**: Back/Next navigation buttons
4. **Right Sidebar** (desktop): Help documentation for current step

### Presale Management
1. **Header**: Presale title and status
2. **Top Row**: Key metrics (3-card grid - raised/cap/participants)
3. **Main Content**: Two tabs - "Overview" and "Participants"
4. **Actions Bar**: Admin controls (pause, finalize, withdraw)

---

## Interactions & Animations
**Minimal & Purposeful**:
- Smooth page transitions: transition-opacity duration-200
- Button hover: subtle scale (scale-105)
- Card hover: shadow elevation change only
- Loading states: Spinner for blockchain operations
- Success: Subtle checkmark animation
- **No** parallax, no scroll-triggered effects

---

## Images
**Logo Placement**: Header navbar (h-8 or h-10)
**No Large Hero Image**: Use CSS gradient background instead to emphasize the encrypted/secure nature of the platform
**Icons**: Heroicons for UI elements, custom encryption/lock icons for privacy features
**Avatar Placeholders**: Jazzicon for wallet addresses

---

## Responsive Behavior
- Mobile: Single column, bottom sheet for wallet connection
- Tablet: Maintain 2-column grids where possible
- Desktop: Full multi-column layouts, persistent sidebars

This design balances crypto-native familiarity with clear information hierarchy for complex FHE operations, ensuring users trust the platform with financial operations.
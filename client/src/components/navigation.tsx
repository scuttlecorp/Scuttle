import { Link, useLocation } from 'wouter';
import { WalletButton } from './wallet-button';
import { ThemeToggle } from './theme-toggle';
import { useWallet } from '@/hooks/use-wallet';
import { getNetworkName } from '@/lib/web3';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

export function Navigation() {
  const [location] = useLocation();
  const { chainId, isConnected } = useWallet();

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/create-token', label: 'Create Token' },
    { path: '/presales', label: 'Presales' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2 cursor-pointer" data-testid="link-home">
              <img 
                src="/scuttle-logo.jpg" 
                alt="Scuttle Social" 
                className="h-10 w-10 rounded-md object-cover"
              />
              <div className="hidden sm:block">
                <div className="text-lg font-semibold">Scuttle Social</div>
                <div className="text-xs text-muted-foreground">Confidential Tokens</div>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-md transition-colors hover-elevate active-elevate-2 cursor-pointer inline-block',
                    location === item.path
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  data-testid={`link-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Network Badge */}
            {isConnected && chainId && (
              <Badge variant="outline" className="hidden lg:flex gap-1.5" data-testid="badge-network">
                <Shield className="h-3 w-3" />
                {getNetworkName(chainId)}
              </Badge>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wallet Button */}
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}

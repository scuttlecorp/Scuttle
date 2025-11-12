import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWallet } from '@/hooks/use-wallet';
import { truncateAddress, getNetworkName } from '@/lib/web3';
import { Wallet, LogOut, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function WalletButton() {
  const { address, chainId, isConnected, isConnecting, connect, disconnect } = useWallet();
  const { toast } = useToast();

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: 'Address copied',
        description: 'Wallet address copied to clipboard',
      });
    }
  };

  const handleViewExplorer = () => {
    if (address && chainId) {
      const explorerUrl = chainId === 11155111
        ? `https://sepolia.etherscan.io/address/${address}`
        : `https://etherscan.io/address/${address}`;
      window.open(explorerUrl, '_blank');
    }
  };

  if (!isConnected) {
    return (
      <Button
        onClick={connect}
        disabled={isConnecting}
        className="gap-2"
        data-testid="button-connect-wallet"
      >
        <Wallet className="h-4 w-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 font-mono" data-testid="button-wallet-menu">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          {truncateAddress(address || '')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Wallet Address</span>
          <span className="font-mono text-sm">{truncateAddress(address || '', 6)}</span>
        </DropdownMenuLabel>
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Network</span>
          <span className="text-sm">{getNetworkName(chainId || 0)}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyAddress} className="gap-2" data-testid="button-copy-address">
          <Copy className="h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleViewExplorer} className="gap-2" data-testid="button-view-explorer">
          <ExternalLink className="h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="gap-2 text-destructive" data-testid="button-disconnect">
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

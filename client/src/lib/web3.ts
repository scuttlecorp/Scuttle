// Web3 utility functions for wallet connection and blockchain interactions

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
}

export const truncateAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const formatEther = (wei: string): string => {
  try {
    const value = BigInt(wei);
    const ether = Number(value) / 1e18;
    return ether.toFixed(4);
  } catch {
    return '0.0000';
  }
};

export const parseEther = (ether: string): string => {
  try {
    const value = parseFloat(ether);
    const wei = BigInt(Math.floor(value * 1e18));
    return wei.toString();
  } catch {
    return '0';
  }
};

export const getNetworkName = (chainId: number): string => {
  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    11155111: 'Sepolia Testnet',
    8008135: 'FHEVM Sepolia',
  };
  return networks[chainId] || `Unknown Network (${chainId})`;
};

export const getExplorerUrl = (txHash: string, chainId: number): string => {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
  };
  const baseUrl = explorers[chainId] || 'https://etherscan.io';
  return `${baseUrl}/tx/${txHash}`;
};

// Mock wallet connection for demo purposes
// In production, this would integrate with ethers.js or wagmi
export class WalletManager {
  private listeners: ((state: WalletState) => void)[] = [];
  private state: WalletState = {
    address: null,
    chainId: null,
    isConnected: false,
  };

  subscribe(listener: (state: WalletState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): WalletState {
    return this.state;
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  async connect(): Promise<void> {
    // Mock connection - in production, use window.ethereum
    // Simulate async wallet connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.state = {
      address: '0x' + Math.random().toString(16).slice(2, 42).padEnd(40, '0'),
      chainId: 11155111, // Sepolia
      isConnected: true,
    };
    
    this.notify();
  }

  async disconnect(): Promise<void> {
    this.state = {
      address: null,
      chainId: null,
      isConnected: false,
    };
    this.notify();
  }

  async switchNetwork(chainId: number): Promise<void> {
    if (!this.state.isConnected) {
      throw new Error('Wallet not connected');
    }
    this.state.chainId = chainId;
    this.notify();
  }
}

export const walletManager = new WalletManager();

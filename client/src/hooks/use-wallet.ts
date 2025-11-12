import { useState, useEffect } from 'react';
import { walletManager, type WalletState } from '@/lib/web3';

export function useWallet() {
  const [state, setState] = useState<WalletState>(walletManager.getState());
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const unsubscribe = walletManager.subscribe(setState);
    return unsubscribe;
  }, []);

  const connect = async () => {
    try {
      setIsConnecting(true);
      await walletManager.connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    await walletManager.disconnect();
  };

  const switchNetwork = async (chainId: number) => {
    await walletManager.switchNetwork(chainId);
  };

  return {
    ...state,
    isConnecting,
    connect,
    disconnect,
    switchNetwork,
  };
}

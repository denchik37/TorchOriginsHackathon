import { useState, useCallback } from 'react';
import { useWallet } from '@buidlerlabs/hashgraph-react-wallets';
import { HashpackConnector, MetamaskConnector, BladeConnector, KabilaConnector, HWCConnector } from '@buidlerlabs/hashgraph-react-wallets/connectors';

export type WalletType = 'hashpack' | 'metamask' | 'blade' | 'kabila' | 'walletconnect';

const walletConnectors = {
  hashpack: HashpackConnector,
  metamask: MetamaskConnector,
  blade: BladeConnector,
  kabila: KabilaConnector,
  walletconnect: HWCConnector,
};

export function useMultiWallet() {
  const [currentWallet, setCurrentWallet] = useState<WalletType>('hashpack');
  
  const hashpackWallet = useWallet(HashpackConnector);
  const metamaskWallet = useWallet(MetamaskConnector);
  const bladeWallet = useWallet(BladeConnector);
  const kabilaWallet = useWallet(KabilaConnector);
  const walletConnectWallet = useWallet(HWCConnector);

  const getCurrentWallet = useCallback(() => {
    switch (currentWallet) {
      case 'hashpack':
        return hashpackWallet;
      case 'metamask':
        return metamaskWallet;
      case 'blade':
        return bladeWallet;
      case 'kabila':
        return kabilaWallet;
      case 'walletconnect':
        return walletConnectWallet;
      default:
        return hashpackWallet;
    }
  }, [currentWallet, hashpackWallet, metamaskWallet, bladeWallet, kabilaWallet, walletConnectWallet]);

  const connectWallet = useCallback(async (walletType: WalletType) => {
    setCurrentWallet(walletType);
    
    try {
      switch (walletType) {
        case 'hashpack':
          await hashpackWallet.connect();
          break;
        case 'metamask':
          await metamaskWallet.connect();
          break;
        case 'blade':
          await bladeWallet.connect();
          break;
        case 'kabila':
          await kabilaWallet.connect();
          break;
        case 'walletconnect':
          await walletConnectWallet.connect();
          break;
      }
    } catch (error) {
      console.error(`Failed to connect ${walletType}:`, error);
      throw error;
    }
  }, [hashpackWallet, metamaskWallet, bladeWallet, kabilaWallet, walletConnectWallet]);

  const disconnectWallet = useCallback(async () => {
    try {
      switch (currentWallet) {
        case 'hashpack':
          await hashpackWallet.disconnect();
          break;
        case 'metamask':
          await metamaskWallet.disconnect();
          break;
        case 'blade':
          await bladeWallet.disconnect();
          break;
        case 'kabila':
          await kabilaWallet.disconnect();
          break;
        case 'walletconnect':
          await walletConnectWallet.disconnect();
          break;
      }
    } catch (error) {
      console.error(`Failed to disconnect ${currentWallet}:`, error);
      throw error;
    }
  }, [currentWallet, hashpackWallet, metamaskWallet, bladeWallet, kabilaWallet, walletConnectWallet]);

  const currentWalletState = getCurrentWallet();

  return {
    currentWallet,
    currentWalletState,
    connectWallet,
    disconnectWallet,
    setCurrentWallet,
    walletConnectors,
  };
}

import { useState, useCallback, useEffect } from 'react';
import { useWallet, useAccountId, useAccountInfo, useEvmAddress } from '@buidlerlabs/hashgraph-react-wallets';
import { HashpackConnector, MetamaskConnector, BladeConnector, KabilaConnector, HWCConnector } from '@buidlerlabs/hashgraph-react-wallets/connectors';
import { AccountBalanceQuery, Client } from '@hashgraph/sdk';

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
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  
  // Wallet instances
  const hashpackWallet = useWallet(HashpackConnector);
  const metamaskWallet = useWallet(MetamaskConnector);
  const bladeWallet = useWallet(BladeConnector);
  const kabilaWallet = useWallet(KabilaConnector);
  const walletConnectWallet = useWallet(HWCConnector);

  // Account ID hooks for each wallet
  const hashpackAccountId = useAccountId({ connector: HashpackConnector });
  const metamaskAccountId = useAccountId({ connector: MetamaskConnector });
  const bladeAccountId = useAccountId({ connector: BladeConnector });
  const kabilaAccountId = useAccountId({ connector: KabilaConnector });
  const walletConnectAccountId = useAccountId({ connector: HWCConnector });

  // Account Info hooks for each wallet
  const hashpackAccountInfo = useAccountInfo({ connector: HashpackConnector });
  const metamaskAccountInfo = useAccountInfo({ connector: MetamaskConnector });
  const bladeAccountInfo = useAccountInfo({ connector: BladeConnector });
  const kabilaAccountInfo = useAccountInfo({ connector: KabilaConnector });
  const walletConnectAccountInfo = useAccountInfo({ connector: HWCConnector });

  // EVM Address hooks for each wallet
  const hashpackEvmAddress = useEvmAddress({ connector: HashpackConnector });
  const metamaskEvmAddress = useEvmAddress({ connector: MetamaskConnector });
  const bladeEvmAddress = useEvmAddress({ connector: BladeConnector });
  const kabilaEvmAddress = useEvmAddress({ connector: KabilaConnector });
  const walletConnectEvmAddress = useEvmAddress({ connector: HWCConnector });

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

  const getCurrentAccountId = useCallback(() => {
    switch (currentWallet) {
      case 'hashpack':
        return hashpackAccountId.data;
      case 'metamask':
        return metamaskAccountId.data;
      case 'blade':
        return bladeAccountId.data;
      case 'kabila':
        return kabilaAccountId.data;
      case 'walletconnect':
        return walletConnectAccountId.data;
      default:
        return hashpackAccountId.data;
    }
  }, [currentWallet, hashpackAccountId.data, metamaskAccountId.data, bladeAccountId.data, kabilaAccountId.data, walletConnectAccountId.data]);

  const getCurrentEvmAddress = useCallback(() => {
    switch (currentWallet) {
      case 'hashpack':
        return hashpackEvmAddress.data;
      case 'metamask':
        return metamaskEvmAddress.data;
      case 'blade':
        return bladeEvmAddress.data;
      case 'kabila':
        return kabilaEvmAddress.data;
      case 'walletconnect':
        return walletConnectEvmAddress.data;
      default:
        return hashpackEvmAddress.data;
    }
  }, [currentWallet, hashpackEvmAddress.data, metamaskEvmAddress.data, bladeEvmAddress.data, kabilaEvmAddress.data, walletConnectEvmAddress.data]);

  const getCurrentAccountInfoQuery = useCallback(() => {
    switch (currentWallet) {
      case 'hashpack':
        return hashpackAccountInfo;
      case 'metamask':
        return metamaskAccountInfo;
      case 'blade':
        return bladeAccountInfo;
      case 'kabila':
        return kabilaAccountInfo;
      case 'walletconnect':
        return walletConnectAccountInfo;
      default:
        return hashpackAccountInfo;
    }
  }, [currentWallet, hashpackAccountInfo, metamaskAccountInfo, bladeAccountInfo, kabilaAccountInfo, walletConnectAccountInfo]);

  const getCurrentEvmAddressQuery = useCallback(() => {
    switch (currentWallet) {
      case 'hashpack':
        return hashpackEvmAddress;
      case 'metamask':
        return metamaskEvmAddress;
      case 'blade':
        return bladeEvmAddress;
      case 'kabila':
        return kabilaEvmAddress;
      case 'walletconnect':
        return walletConnectEvmAddress;
      default:
        return hashpackEvmAddress;
    }
  }, [currentWallet, hashpackEvmAddress, metamaskEvmAddress, bladeEvmAddress, kabilaEvmAddress, walletConnectEvmAddress]);

  // Fetch balance using Hedera SDK
  const fetchBalance = useCallback(async (accountId: string) => {
    if (!accountId) return;
    
    setBalanceLoading(true);
    setBalanceError(null);
    
    try {
      // Use testnet for now - you can make this configurable
      const client = Client.forTestnet();
      
      const query = new AccountBalanceQuery()
        .setAccountId(accountId);
      
      const accountBalance = await query.execute(client);
      const hbarBalance = accountBalance.hbars.toString();
      
      setBalance(hbarBalance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalanceError(error instanceof Error ? error.message : 'Failed to fetch balance');
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  // Fetch balance when account ID changes
  useEffect(() => {
    const accountId = getCurrentAccountId();
    if (accountId) {
      fetchBalance(accountId);
    } else {
      setBalance(null);
      setBalanceError(null);
    }
  }, [getCurrentAccountId, fetchBalance]);

  const getCurrentAccountInfo = useCallback(() => {
    const wallet = getCurrentWallet();
    const accountId = getCurrentAccountId();
    const evmAddress = getCurrentEvmAddress();
    const accountInfoQuery = getCurrentAccountInfoQuery();
    
    if (wallet.isConnected && accountId) {
      return {
        accountId,
        evmAddress,
        address: accountId, // For compatibility, both accountId and address point to the same value
        publicKey: accountInfoQuery.data?.publicKey || (wallet as any)?.publicKey || (wallet as any)?.account?.publicKey,
        walletType: currentWallet,
        isConnected: wallet.isConnected,
        // Additional info from the query results
        isLoading: getCurrentAccountIdQuery()?.isLoading || accountInfoQuery?.isLoading || false,
        error: getCurrentAccountIdQuery()?.error || accountInfoQuery?.error || null,
        // Detailed account info from useAccountInfo
        accountInfo: accountInfoQuery.data,
        // Balance information
        balance,
        balanceLoading,
        balanceError,
      };
    }
    return null;
  }, [getCurrentWallet, getCurrentAccountId, getCurrentEvmAddress, getCurrentAccountInfoQuery, currentWallet, balance, balanceLoading, balanceError]);

  const getCurrentAccountIdQuery = useCallback(() => {
    switch (currentWallet) {
      case 'hashpack':
        return hashpackAccountId;
      case 'metamask':
        return metamaskAccountId;
      case 'blade':
        return bladeAccountId;
      case 'kabila':
        return kabilaAccountId;
      case 'walletconnect':
        return walletConnectAccountId;
      default:
        return hashpackAccountId;
    }
  }, [currentWallet, hashpackAccountId, metamaskAccountId, bladeAccountId, kabilaAccountId, walletConnectAccountId]);

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
  const currentAccountId = getCurrentAccountId();
  const currentEvmAddress = getCurrentEvmAddress();
  const currentAccountInfo = getCurrentAccountInfo();
  const currentAccountIdQuery = getCurrentAccountIdQuery();
  const currentAccountInfoQuery = getCurrentAccountInfoQuery();
  const currentEvmAddressQuery = getCurrentEvmAddressQuery();

  return {
    currentWallet,
    currentWalletState,
    currentAccountId,
    currentEvmAddress,
    currentAccountInfo,
    currentAccountIdQuery, // Expose the full query result for advanced usage
    currentAccountInfoQuery, // Expose the account info query result
    currentEvmAddressQuery, // Expose the EVM address query result
    balance,
    balanceLoading,
    balanceError,
    fetchBalance, // Expose the fetch balance function for manual refresh
    connectWallet,
    disconnectWallet,
    setCurrentWallet,
    walletConnectors,
  };
}

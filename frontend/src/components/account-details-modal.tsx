'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  User, 
  Copy, 
  Check, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  Coins,
  Key,
  Shield,
  ExternalLink
} from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import { useMultiWallet } from '@/hooks/useMultiWallet';

interface AccountDetailsModalProps {
  children: React.ReactNode;
}

export function AccountDetailsModal({ children }: AccountDetailsModalProps) {
  const { 
    currentAccountInfo, 
    currentAccountIdQuery, 
    currentAccountInfoQuery,
    currentEvmAddressQuery,
    fetchBalance,
    balance,
    balanceLoading,
    balanceError 
  } = useMultiWallet();
  
  const [copied, setCopied] = React.useState<string | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRefreshBalance = () => {
    if (currentAccountInfo?.accountId) {
      fetchBalance(currentAccountInfo.accountId);
    }
  };

  const getWalletIcon = (walletType: string) => {
    switch (walletType) {
      case 'hashpack':
        return '🟣';
      case 'metamask':
        return '🦊';
      case 'blade':
        return '⚔️';
      case 'kabila':
        return '🔗';
      case 'walletconnect':
        return '🔗';
      default:
        return '💳';
    }
  };

  const getWalletName = (walletType: string) => {
    switch (walletType) {
      case 'hashpack':
        return 'HashPack';
      case 'metamask':
        return 'MetaMask';
      case 'blade':
        return 'Blade';
      case 'kabila':
        return 'Kabila';
      case 'walletconnect':
        return 'WalletConnect';
      default:
        return 'Unknown';
    }
  };

  const formatBalance = (balance: string | null) => {
    if (!balance) return '0 HBAR';
    const numBalance = parseFloat(balance);
    if (numBalance >= 1000) {
      return `${(numBalance / 1000).toFixed(2)}k HBAR`;
    }
    return `${numBalance.toFixed(2)} HBAR`;
  };

  if (!currentAccountInfo) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Account Details</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Wallet Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">{getWalletIcon(currentAccountInfo.walletType)}</span>
                <span>{getWalletName(currentAccountInfo.walletType)}</span>
                <Badge variant="outline" className="ml-auto">
                  {currentAccountInfo.isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={currentAccountInfo.isConnected ? "default" : "secondary"}>
                    {currentAccountInfo.isConnected ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm font-medium">
                    {currentAccountInfo.walletType === 'hashpack' || currentAccountInfo.walletType === 'blade' 
                      ? 'Hedera Native' 
                      : 'EVM Compatible'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Account ID/Address */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {currentAccountInfo.walletType === 'hashpack' || currentAccountInfo.walletType === 'blade' 
                        ? 'Account ID' 
                        : 'Address'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(currentAccountInfo.accountId || '', 'accountId')}
                      className="flex items-center space-x-1"
                    >
                      {copied === 'accountId' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                  <code className="block w-full p-3 bg-neutral-800 rounded text-sm break-all">
                    {currentAccountInfo.accountId || 'N/A'}
                  </code>
                </div>

                {/* EVM Address */}
                {currentAccountInfo.evmAddress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">EVM Address</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(currentAccountInfo.evmAddress || '', 'evmAddress')}
                        className="flex items-center space-x-1"
                      >
                        {copied === 'evmAddress' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <code className="block w-full p-3 bg-neutral-800 rounded text-sm break-all">
                      {currentAccountInfo.evmAddress}
                    </code>
                  </div>
                )}

                {/* Public Key */}
                {currentAccountInfo.publicKey && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center space-x-1">
                        <Key className="w-4 h-4" />
                        <span>Public Key</span>
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(currentAccountInfo.publicKey || '', 'publicKey')}
                        className="flex items-center space-x-1"
                      >
                        {copied === 'publicKey' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <code className="block w-full p-3 bg-neutral-800 rounded text-sm break-all">
                      {formatAddress(currentAccountInfo.publicKey, 8)}
                    </code>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Balance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Coins className="w-5 h-5" />
                <span>Balance</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshBalance}
                  disabled={balanceLoading}
                  className="ml-auto"
                >
                  {balanceLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {balanceLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading balance...</span>
                  </div>
                ) : balanceError ? (
                  <div className="flex items-center space-x-2 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>{balanceError}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">HBAR Balance</span>
                      <span className="text-2xl font-bold text-green-500">
                        {formatBalance(balance)}
                      </span>
                    </div>
                    {balance && (
                      <div className="text-xs text-muted-foreground">
                        Raw: {balance} tinybars
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Query Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Query Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Account ID Query */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account ID Query</span>
                    <Badge variant={currentAccountIdQuery?.isLoading ? "secondary" : "outline"}>
                      {currentAccountIdQuery?.isLoading ? 'Loading' : 'Ready'}
                    </Badge>
                  </div>
                  {currentAccountIdQuery?.error && (
                    <div className="flex items-center space-x-2 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{currentAccountIdQuery.error.message}</span>
                    </div>
                  )}
                </div>

                {/* EVM Address Query */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">EVM Address Query</span>
                    <Badge variant={currentEvmAddressQuery?.isLoading ? "secondary" : "outline"}>
                      {currentEvmAddressQuery?.isLoading ? 'Loading' : 'Ready'}
                    </Badge>
                  </div>
                  {currentEvmAddressQuery?.error && (
                    <div className="flex items-center space-x-2 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{currentEvmAddressQuery.error.message}</span>
                    </div>
                  )}
                </div>

                {/* Account Info Query */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account Info Query</span>
                    <Badge variant={currentAccountInfoQuery?.isLoading ? "secondary" : "outline"}>
                      {currentAccountInfoQuery?.isLoading ? 'Loading' : 'Ready'}
                    </Badge>
                  </div>
                  {currentAccountInfoQuery?.error && (
                    <div className="flex items-center space-x-2 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{currentAccountInfoQuery.error.message}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="w-5 h-5" />
                <span>Network</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Network</span>
                  <Badge variant="outline">Testnet</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Explorer</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => window.open(`https://hashscan.io/testnet/account/${currentAccountInfo.accountId}`, '_blank')}
                  >
                    View on HashScan
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import React from 'react';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, User, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { formatAddress } from '@/lib/utils';

export default function HashpackTestPage() {
  const { 
    currentWallet, 
    currentWalletState, 
    currentAccountId, 
    currentEvmAddress,
    currentAccountInfo,
    currentAccountIdQuery,
    currentEvmAddressQuery,
    currentAccountInfoQuery,
    connectWallet,
    disconnectWallet 
  } = useMultiWallet();
  
  const [copied, setCopied] = React.useState(false);

  const handleCopyAddress = async () => {
    if (currentAccountId) {
      await navigator.clipboard.writeText(currentAccountId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDisplayAddress = () => {
    if (!currentAccountInfo) return '';
    
    // For Hedera native wallets (hashpack, blade), show accountId
    if (currentAccountInfo.walletType === 'hashpack' || currentAccountInfo.walletType === 'blade') {
      return currentAccountInfo.accountId || currentAccountInfo.address;
    }
    
    // For non-Hedera wallets (metamask, walletconnect, kabila), show address
    return currentAccountInfo.address || currentAccountInfo.accountId;
  };

  const displayAddress = getDisplayAddress();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Wallet Connection Test</h1>
      
      <div className="grid gap-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Connection Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Connected:</strong> {currentWalletState.isConnected ? 'Yes' : 'No'}</p>
              <p><strong>Current Wallet:</strong> {currentWallet}</p>
              <p><strong>Wallet Type:</strong> {currentAccountInfo?.walletType || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Account ID Query Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Account ID Query Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span><strong>Loading:</strong></span>
                {currentAccountIdQuery?.isLoading ? (
                  <div className="flex items-center space-x-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading account ID...</span>
                  </div>
                ) : (
                  <span>Not loading</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span><strong>Error:</strong></span>
                {currentAccountIdQuery?.error ? (
                  <div className="flex items-center space-x-1 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>{currentAccountIdQuery.error.message}</span>
                  </div>
                ) : (
                  <span>No error</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span><strong>Data:</strong></span>
                <code className="bg-neutral-800 px-2 py-1 rounded text-sm">
                  {currentAccountId || 'No data'}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info Query Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Account Info Query Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span><strong>Loading:</strong></span>
                {currentAccountInfoQuery?.isLoading ? (
                  <div className="flex items-center space-x-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading account info...</span>
                  </div>
                ) : (
                  <span>Not loading</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span><strong>Error:</strong></span>
                {currentAccountInfoQuery?.error ? (
                  <div className="flex items-center space-x-1 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>{currentAccountInfoQuery.error.message}</span>
                  </div>
                ) : (
                  <span>No error</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span><strong>Data:</strong></span>
                <code className="bg-neutral-800 px-2 py-1 rounded text-sm">
                  {currentAccountInfoQuery?.data ? JSON.stringify(currentAccountInfoQuery.data, null, 2) : 'No data'}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EVM Address Query Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>EVM Address Query Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span><strong>Loading:</strong></span>
                {currentEvmAddressQuery?.isLoading ? (
                  <div className="flex items-center space-x-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading EVM address...</span>
                  </div>
                ) : (
                  <span>Not loading</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span><strong>Error:</strong></span>
                {currentEvmAddressQuery?.error ? (
                  <div className="flex items-center space-x-1 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>{currentEvmAddressQuery.error.message}</span>
                  </div>
                ) : (
                  <span>No error</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span><strong>Data:</strong></span>
                <code className="bg-neutral-800 px-2 py-1 rounded text-sm">
                  {currentEvmAddress || 'No data'}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        {currentWalletState.isConnected && currentAccountInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Display Address */}
                {displayAddress && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Address/Account ID:</span>
                    <code className="bg-neutral-800 px-2 py-1 rounded text-sm">
                      {displayAddress}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="flex items-center space-x-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                )}

                {/* Full Account Info */}
                <div className="space-y-2">
                  <p><strong>Account ID:</strong> {currentAccountInfo.accountId || 'N/A'}</p>
                  <p><strong>EVM Address:</strong> {currentAccountInfo.evmAddress || 'N/A'}</p>
                  <p><strong>Address:</strong> {currentAccountInfo.address || 'N/A'}</p>
                  <p><strong>Public Key:</strong> {currentAccountInfo.publicKey || 'N/A'}</p>
                  <p><strong>Wallet Type:</strong> {currentAccountInfo.walletType}</p>
                  <p><strong>Connected:</strong> {currentAccountInfo.isConnected ? 'Yes' : 'No'}</p>
                  <p><strong>Loading:</strong> {currentAccountInfo.isLoading ? 'Yes' : 'No'}</p>
                  <p><strong>Error:</strong> {currentAccountInfo.error ? currentAccountInfo.error.message : 'None'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connection Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-x-4">
              {!currentWalletState.isConnected ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Click the wallet button in the header to connect a wallet
                  </p>
                  <Button 
                    onClick={() => connectWallet('hashpack')}
                    className="bg-vibrant-purple hover:bg-vibrant-purple/90"
                  >
                    Connect HashPack
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={disconnectWallet}
                  variant="outline"
                >
                  Disconnect Wallet
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Raw Wallet State */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Wallet State</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-neutral-800 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(currentWalletState, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Raw Account ID Query */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Account ID Query</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-neutral-800 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(currentAccountIdQuery, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Raw Account Info Query */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Account Info Query</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-neutral-800 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(currentAccountInfoQuery, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Raw EVM Address Query */}
        <Card>
          <CardHeader>
            <CardTitle>Raw EVM Address Query</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-neutral-800 p-4 rounded text-xs overflow-auto">
              {JSON.stringify(currentEvmAddressQuery, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

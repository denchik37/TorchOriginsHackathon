'use client';

import React, { useState } from 'react';
import { useMultiWallet, WalletType } from '@/hooks/useMultiWallet';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Wallet, ChevronDown, User, Copy, Check, Coins, Info } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import { AccountDetailsModal } from '@/components/account-details-modal';

interface WalletOption {
  name: string;
  type: WalletType;
  icon: string;
  description: string;
}

const walletOptions: WalletOption[] = [
  {
    name: 'HashPack',
    type: 'hashpack',
    icon: '🟣',
    description: 'Hedera native wallet'
  },
  {
    name: 'MetaMask',
    type: 'metamask',
    icon: '🦊',
    description: 'Ethereum wallet with Hedera support'
  },
  {
    name: 'WalletConnect',
    type: 'walletconnect',
    icon: '🔗',
    description: 'Connect any wallet via QR code'
  },
  {
    name: 'Blade',
    type: 'blade',
    icon: '⚔️',
    description: 'Hedera native wallet'
  },
  {
    name: 'Kabila',
    type: 'kabila',
    icon: '🔗',
    description: 'Hedera wallet'
  }
];

export function WalletSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { 
    currentWallet, 
    currentWalletState, 
    currentAccountId, 
    currentAccountInfo, 
    balance,
    balanceLoading,
    connectWallet, 
    disconnectWallet 
  } = useMultiWallet();

  const handleWalletSelect = async (walletType: WalletType) => {
    setIsOpen(false);
    
    try {
      await connectWallet(walletType);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const handleCopyAddress = async () => {
    if (currentAccountId) {
      await navigator.clipboard.writeText(currentAccountId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get display address - prefer accountId for Hedera native wallets, address for others
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
  const currentWalletOption = walletOptions.find(w => w.type === currentWallet);

  const formatBalance = (balance: string | null) => {
    if (!balance) return '0 HBAR';
    const numBalance = parseFloat(balance);
    if (numBalance >= 1000) {
      return `${(numBalance / 1000).toFixed(2)}k HBAR`;
    }
    return `${numBalance.toFixed(2)} HBAR`;
  };

  if (currentWalletState.isConnected) {
    return (
      <div className="flex items-center space-x-2">
        {/* Balance Display */}
        <Button
          variant="outline"
          size="sm"
          className="border-vibrant-purple text-vibrant-purple"
        >
          {balanceLoading ? (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <Coins className="w-3 h-3" />
              <span className="text-xs">{formatBalance(balance)}</span>
            </div>
          )}
        </Button>

        {/* Account Details Modal */}
        <AccountDetailsModal>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 bg-neutral-800 border-neutral-700 text-light-gray hover:bg-neutral-700"
          >
            <Info className="w-3 h-3" />
            <span className="text-xs">Details</span>
          </Button>
        </AccountDetailsModal>
        
        {/* Account Info Button */}
        {displayAddress && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 bg-neutral-800 border-neutral-700 text-light-gray hover:bg-neutral-700"
            onClick={handleCopyAddress}
          >
            <User className="w-3 h-3" />
            <span className="text-xs font-mono">{formatAddress(displayAddress, 4)}</span>
            {copied && <Check className="w-3 h-3 text-green-400" />}
          </Button>
        )}
        
        {/* Wallet Type Badge */}
        {currentWalletOption && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 border-vibrant-purple text-vibrant-purple"
          >
            <span className="text-sm">{currentWalletOption.icon}</span>
            <span className="text-xs font-medium">{currentWalletOption.name}</span>
          </Button>
        )}
        
        {/* Disconnect Button */}
        <Button onClick={handleDisconnect} variant="outline" size="sm">
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose your wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {walletOptions.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleWalletSelect(wallet.type)}
            >
              <div className="flex items-center space-x-3 w-full">
                <span className="text-2xl">{wallet.icon}</span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{wallet.name}</span>
                  <span className="text-sm text-muted-foreground">{wallet.description}</span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

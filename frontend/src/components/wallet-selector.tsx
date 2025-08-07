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
import { Wallet, ChevronDown } from 'lucide-react';

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
  const { currentWallet, currentWalletState, connectWallet, disconnectWallet } = useMultiWallet();

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

  if (currentWalletState.isConnected) {
    return (
      <Button onClick={handleDisconnect} variant="outline" size="sm">
        Disconnect Wallet
      </Button>
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

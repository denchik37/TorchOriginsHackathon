'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ExternalLink,
  Wallet,
  Settings,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Copy,
  Check,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip } from '@/components/ui/tooltip';

import { formatAddress } from '@/lib/utils';
import { WalletSelector } from '@/components/wallet-selector';
import { useMultiWallet } from '@/hooks/useMultiWallet';

export function Header() {
  const { currentWalletState } = useMultiWallet();
  const [copied, setCopied] = React.useState(false);

  const handleCopyAddress = async () => {
    // Try to get the address from various possible properties
    const address =
      (currentWalletState as any)?.accountId ||
      (currentWalletState as any)?.address ||
      (currentWalletState as any)?.account?.id ||
      (currentWalletState as any)?.account?.address;
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Try to get the wallet address from various possible properties
  const walletAddress =
    (currentWalletState as any)?.accountId ||
    (currentWalletState as any)?.address ||
    (currentWalletState as any)?.account?.id ||
    (currentWalletState as any)?.account?.address ||
    '';

  return (
    <header className="border-b border-border bg-neutral-950 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left side - Logo and Website link */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} />
            <span className="text-xl font-bold text-light-gray">Torch</span>
          </Link>
          <Button asChild size="sm" variant="link">
            <a href="https://torch.bet/" target="_blank" rel="noopener noreferrer">
              Website
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </Button>
        </div>

        {/* Right side - Navigation and Wallet */}
        <div className="flex items-center space-x-4">
          <Link href="/my-bets">
            <Button variant="ghost" size="sm">
              <Wallet className="w-4 h-4 mr-2" />
              My bets
            </Button>
          </Link>

          {currentWalletState.isConnected ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-light-gray">HBAR Balance</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-vibrant-purple text-vibrant-purple hover:bg-vibrant-purple hover:text-white"
                >
                  Get
                  <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Wallet Address Button */}
              {walletAddress && (
                <Tooltip content={`${walletAddress} (Click to copy)`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 bg-neutral-800 border-neutral-700 text-light-gray hover:bg-neutral-700"
                    onClick={handleCopyAddress}
                  >
                    <User className="w-3 h-3" />
                    <span className="text-xs font-mono">{formatAddress(walletAddress, 4)}</span>
                    {copied && <Check className="w-3 h-3 text-green-400" />}
                  </Button>
                </Tooltip>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-light-gray">
                    <div className="w-8 h-8 bg-vibrant-purple rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-sm font-medium">Connected</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => currentWalletState.disconnect()}>
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <WalletSelector />
          )}
        </div>
      </div>
    </header>
  );
}

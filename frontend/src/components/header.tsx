"use client"

import React from 'react'
import { Flame, ExternalLink, Wallet, Settings, ChevronDown } from 'lucide-react'
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatAddress } from '@/lib/utils'

export function Header() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({
    address,
  })

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left side - Logo and Website link */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Torch</span>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Website
            <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Right side - Navigation and Wallet */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Wallet className="w-4 h-4 mr-2" />
            My bets
          </Button>

          <Button variant="ghost" size="sm">
            <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-xs font-bold">H</span>
            </div>
            Hedera
          </Button>

          {isConnected ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {balance ? `${parseFloat(balance.formatted).toFixed(0)} HBAR` : '0 HBAR'}
                </span>
                <Button variant="outline" size="sm">
                  Get
                  <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-torch-purple rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <span className="text-sm font-medium">
                      {formatAddress(address || '', 2)}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => disconnect()}>
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="torch" size="sm">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          )}

          <ThemeToggle />
          
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
} 
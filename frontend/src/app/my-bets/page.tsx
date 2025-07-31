"use client"

import React, { useState } from 'react'
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'

interface Bet {
  id: number
  date: string
  time: string
  status: 'active' | 'won' | 'lost' | 'unredeemed'
  priceRange: string
  betAmount: number
  winAmount?: number
  remainingDays?: number
  isRedeemed?: boolean
}

export default function MyBetsPage() {
  const [activeCategory, setActiveCategory] = useState('all')

  // Mock data for bets
  const bets: Bet[] = [
    {
      id: 1,
      date: 'Aug 1',
      time: '13:00 UTC',
      status: 'active',
      priceRange: '0.2475 - 0.2843',
      betAmount: 1.67,
      winAmount: 5.2,
      remainingDays: 2
    },
    {
      id: 2,
      date: 'Jul 31',
      time: '00:00 UTC',
      status: 'won',
      priceRange: '0.31 - 0.33',
      betAmount: 200,
      winAmount: 240,
      isRedeemed: true
    },
    {
      id: 3,
      date: 'Jul 30',
      time: '23:59 UTC',
      status: 'lost',
      priceRange: '1.3 - 1.5',
      betAmount: 31.03
    },
    {
      id: 4,
      date: 'Jul 10',
      time: '17:15 UTC',
      status: 'unredeemed',
      priceRange: '0.2 - 1',
      betAmount: 0.2,
      winAmount: 0.02
    }
  ]

  const categories = [
    { id: 'all', label: 'All Bets', count: bets.length },
    { id: 'active', label: 'Active', count: bets.filter(bet => bet.status === 'active').length },
    { id: 'unredeemed', label: 'Unredeemed', count: bets.filter(bet => bet.status === 'unredeemed').length },
    { id: 'complete', label: 'Complete', count: bets.filter(bet => bet.status === 'won' || bet.status === 'lost').length }
  ]

  const wonBets = bets.filter(bet => bet.status === 'won').length
  const lostBets = bets.filter(bet => bet.status === 'lost').length
  const unredeemedAmount = bets
    .filter(bet => bet.status === 'unredeemed')
    .reduce((sum, bet) => sum + (bet.winAmount || 0), 0)

  const filteredBets = activeCategory === 'all' 
    ? bets 
    : bets.filter(bet => bet.status === activeCategory)

  const getStatusIcon = (status: Bet['status']) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4 text-vibrant-purple" />
      case 'won':
        return <CheckCircle className="w-4 h-4 text-bright-green" />
      case 'lost':
        return <XCircle className="w-4 h-4 text-medium-gray" />
      case 'unredeemed':
        return <CheckCircle className="w-4 h-4 text-bright-green" />
    }
  }

  const getStatusText = (status: Bet['status']) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'won':
        return 'Won'
      case 'lost':
        return 'Lost'
      case 'unredeemed':
        return 'Won'
    }
  }

  const getCardBackground = (status: Bet['status']) => {
    switch (status) {
      case 'won':
        return 'bg-bright-green/10 border-bright-green/20'
      case 'lost':
        return 'bg-magenta/10 border-magenta/20'
      default:
        return 'bg-dark-slate border-border'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Bet Categories */}
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-vibrant-purple text-white'
                    : 'bg-dark-slate text-light-gray hover:bg-dark-slate/80'
                }`}
              >
                {category.label} {category.count}
              </button>
            ))}
          </div>

          {/* Bet Summary */}
          <div className="flex space-x-4">
            <div className="px-4 py-2 bg-bright-green rounded-full text-sm font-medium text-white">
              Won {wonBets}
            </div>
            <div className="px-4 py-2 bg-magenta rounded-full text-sm font-medium text-white">
              Lost {lostBets}
            </div>
          </div>

          {/* Unredeemed Winnings */}
          {unredeemedAmount > 0 && (
            <div className="bg-dark-slate border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-bright-green rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">H</span>
                </div>
                <span className="text-light-gray font-medium">
                  You have unredeemed {unredeemedAmount} HBAR
                </span>
              </div>
              <Button className="bg-bright-green hover:bg-bright-green/90 text-white">
                Redeem all
              </Button>
            </div>
          )}

          {/* Bet Cards */}
          <div className="space-y-4">
            {filteredBets.map((bet) => (
              <Card key={bet.id} className={`${getCardBackground(bet.status)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-magenta rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">H</span>
                        </div>
                        <div>
                          <div className="text-light-gray font-medium">
                            {bet.date}, {bet.time}
                          </div>
                          <div className="text-medium-gray text-sm">
                            {bet.priceRange}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-light-gray text-sm">
                          Bet: {bet.betAmount} HBAR
                        </div>
                        {bet.winAmount && (
                          <div className="text-light-gray text-sm">
                            {bet.status === 'won' || bet.status === 'unredeemed' 
                              ? `You won: ${bet.winAmount} HBAR`
                              : `Can win: ${bet.winAmount} HBAR`
                            }
                          </div>
                        )}
                        {bet.status === 'active' && (
                          <div className="text-medium-gray text-sm">
                            Last bet: 25 Jul, 17:57 UTC
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(bet.status)}
                        <span className="text-light-gray text-sm font-medium">
                          {bet.status === 'active' && bet.remainingDays 
                            ? `${bet.remainingDays} days remaining`
                            : getStatusText(bet.status)
                          }
                        </span>
                      </div>
                      
                      {bet.status === 'won' && bet.isRedeemed && (
                        <div className="flex items-center space-x-1 text-bright-green text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Redeemed</span>
                        </div>
                      )}
                      
                      {bet.status === 'unredeemed' && (
                        <Button size="sm" className="bg-bright-green hover:bg-bright-green/90 text-white">
                          Redeem
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
"use client"

import React, { useState } from 'react'
import { ExternalLink, Minus, Plus, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KDEChart } from '@/components/kde-chart'
import { PriceRangeSelector } from '@/components/price-range-selector'
import { BetHistory } from '@/components/bet-history'

interface PredictionCardProps {
  className?: string
}

export function PredictionCard({ className }: PredictionCardProps) {
  const [activeTab, setActiveTab] = useState('bet')
  const [selectedRange, setSelectedRange] = useState({ min: 0.2475, max: 0.2843 })
  const [depositAmount, setDepositAmount] = useState('0.0')
  const [resolutionDate, setResolutionDate] = useState('Aug 1')
  const [resolutionTime, setResolutionTime] = useState('13:00')

  // Mock data for the KDE chart
  const forecastData = [
    { date: 'Aug 1', price: 0.2645, confidence: 85 },
    { date: 'Aug 2', price: 0.2680, confidence: 78 },
    { date: 'Aug 3', price: 0.2715, confidence: 72 },
    { date: 'Aug 4', price: 0.2750, confidence: 68 },
    { date: 'Aug 5', price: 0.2785, confidence: 65 },
    { date: 'Aug 6', price: 0.2820, confidence: 62 },
    { date: 'Aug 7', price: 0.2855, confidence: 58 },
    { date: 'Aug 8', price: 0.2890, confidence: 55 },
  ]

  const currentPrice = 0.2645
  const totalBets = 1300
  const activeBets = 375
  const balance = 540

  const handleRangeChange = (min: number, max: number) => {
    setSelectedRange({ min, max })
  }

  const handleMaxDeposit = () => {
    setDepositAmount(balance.toString())
  }

  const calculateMultipliers = () => {
    // Mock calculation for bet quality multipliers
    const sharpness = 0.5 // Based on range width
    const leadTime = 1.5 // Based on time to resolution
    const betQuality = sharpness * leadTime
    return { sharpness, leadTime, betQuality }
  }

  const { sharpness, leadTime, betQuality } = calculateMultipliers()
  const protocolFee = parseFloat(depositAmount) * 0.005 // 0.5%

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm bg-muted px-2 py-1 rounded">Crypto</span>
            <span className="text-sm text-muted-foreground">{activeBets} active bets</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">H</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Predict HBAR token price in USD</h2>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span>Current price: ${currentPrice}</span>
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bet">Bet</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="bet" className="space-y-6">
            {/* Resolution Time Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Resolution Time</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" className="w-8 h-8">
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 text-center">
                      <div className="font-medium">{resolutionDate}</div>
                      <div className="text-sm text-muted-foreground">2025</div>
                    </div>
                    <Button variant="outline" size="icon" className="w-8 h-8">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" className="w-8 h-8">
                      <Minus className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 text-center">
                      <div className="font-medium">{resolutionTime}</div>
                      <div className="text-sm text-muted-foreground">UTC</div>
                    </div>
                    <Button variant="outline" size="icon" className="w-8 h-8">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Range Selection */}
            <PriceRangeSelector
              minPrice={0.2}
              maxPrice={0.34}
              currentPrice={currentPrice}
              totalBets={totalBets}
              onRangeChange={handleRangeChange}
            />

            {/* Bet Quality Multipliers */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Bet Quality</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sharpness:</span>
                  <span className="text-torch-red">{sharpness}x (10..20%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Lead time:</span>
                  <span className="text-torch-red">{leadTime}x (2..4 days)</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Bet quality:</span>
                  <span className="text-torch-red">{betQuality}x (weight)</span>
                </div>
              </div>
            </div>

            {/* Deposit Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Deposit amount</label>
              <div className="relative">
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="pr-20"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-torch-red" />
                  <span className="text-sm font-medium">H</span>
                  <span className="text-sm">HBAR</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span>Balance: {balance}</span>
                <button
                  onClick={handleMaxDeposit}
                  className="text-torch-purple hover:underline"
                >
                  Use MAX
                </button>
              </div>
            </div>

            {/* Protocol Fee */}
            <div className="flex justify-between text-sm">
              <span>Protocol fee:</span>
              <span>0.5% ({protocolFee.toFixed(4)} HBAR)</span>
            </div>

            {/* Submit Button */}
            <Button variant="torch" className="w-full" size="lg">
              Enter Amount
            </Button>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            <KDEChart
              data={forecastData}
              currentPrice={currentPrice}
              className="h-80"
            />
          </TabsContent>

          <TabsContent value="history">
            <BetHistory />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 
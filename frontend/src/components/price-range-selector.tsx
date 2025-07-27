"use client"

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface PriceRangeSelectorProps {
  minPrice: number
  maxPrice: number
  currentPrice: number
  totalBets: number
  onRangeChange: (min: number, max: number) => void
  className?: string
}

export function PriceRangeSelector({
  minPrice,
  maxPrice,
  currentPrice,
  totalBets,
  onRangeChange,
  className
}: PriceRangeSelectorProps) {
  const [selectedMin, setSelectedMin] = useState(minPrice + (maxPrice - minPrice) * 0.2)
  const [selectedMax, setSelectedMax] = useState(maxPrice - (maxPrice - minPrice) * 0.2)

  // Generate histogram data (simulated bet distribution)
  const histogramData = useMemo(() => {
    const buckets = 20
    const bucketSize = (maxPrice - minPrice) / buckets
    const data = []

    for (let i = 0; i < buckets; i++) {
      const bucketMin = minPrice + i * bucketSize
      const bucketMax = bucketMin + bucketSize
      const bucketCenter = (bucketMin + bucketMax) / 2
      
      // Simulate bet distribution with a normal-like curve
      const distanceFromCurrent = Math.abs(bucketCenter - currentPrice)
      const maxDistance = (maxPrice - minPrice) / 2
      const normalizedDistance = distanceFromCurrent / maxDistance
      
      // Create a bell curve around current price
      const betDensity = Math.exp(-Math.pow(normalizedDistance * 2, 2))
      const betAmount = Math.floor(betDensity * totalBets / 10) + Math.random() * 50
      
      data.push({
        min: bucketMin,
        max: bucketMax,
        center: bucketCenter,
        amount: betAmount,
        isSelected: bucketCenter >= selectedMin && bucketCenter <= selectedMax
      })
    }
    
    return data
  }, [minPrice, maxPrice, currentPrice, totalBets, selectedMin, selectedMax])

  const maxBetAmount = Math.max(...histogramData.map(d => d.amount))

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, selectedMax - 0.01)
    setSelectedMin(newMin)
    onRangeChange(newMin, selectedMax)
  }

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, selectedMin + 0.01)
    setSelectedMax(newMax)
    onRangeChange(selectedMin, newMax)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Select Price Range</h3>
        <span className="text-sm text-muted-foreground">
          Total bets: {totalBets.toLocaleString()} HBAR
        </span>
      </div>

      {/* Histogram */}
      <div className="relative h-32 bg-muted rounded-lg p-4">
        <div className="flex items-end justify-between h-full space-x-1">
          {histogramData.map((bucket, index) => (
            <div
              key={index}
              className={cn(
                "flex-1 bg-torch-purple/30 rounded-t transition-all duration-200",
                bucket.isSelected && "bg-torch-purple"
              )}
              style={{
                height: `${(bucket.amount / maxBetAmount) * 100}%`,
                minHeight: '4px'
              }}
            />
          ))}
        </div>

        {/* Current price indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white"
          style={{
            left: `${((currentPrice - minPrice) / (maxPrice - minPrice)) * 100}%`
          }}
        >
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full border-2 border-gray-800" />
        </div>

        {/* Selected range indicators */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-torch-green"
          style={{
            left: `${((selectedMin - minPrice) / (maxPrice - minPrice)) * 100}%`
          }}
        >
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-torch-green rounded-full" />
        </div>
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-torch-green"
          style={{
            left: `${((selectedMax - minPrice) / (maxPrice - minPrice)) * 100}%`
          }}
        >
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-torch-green rounded-full" />
        </div>
      </div>

      {/* Price labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>${minPrice.toFixed(2)}</span>
        <span>${currentPrice.toFixed(4)}</span>
        <span>${maxPrice.toFixed(2)}</span>
      </div>

      {/* Range inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Min Price</label>
          <input
            type="number"
            step="0.0001"
            value={selectedMin.toFixed(4)}
            onChange={(e) => handleMinChange(parseFloat(e.target.value) || selectedMin)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Max Price</label>
          <input
            type="number"
            step="0.0001"
            value={selectedMax.toFixed(4)}
            onChange={(e) => handleMaxChange(parseFloat(e.target.value) || selectedMax)}
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
          />
        </div>
      </div>

      {/* Selected range display */}
      <div className="p-3 bg-muted rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Selected Range:</span>
          <span className="text-sm">
            ${selectedMin.toFixed(4)} - ${selectedMax.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  )
} 
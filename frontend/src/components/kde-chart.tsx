"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, ReferenceArea } from 'recharts'
import { cn } from '@/lib/utils'

interface Bet {
  id: string
  timeHours: number
  price: number
  stake: number
  minPrice: number
  maxPrice: number
}

interface KDEChartProps {
  className?: string
  currentPrice: number
}

export function KDEChart({ className, currentPrice }: KDEChartProps) {
  const [bets, setBets] = useState<Bet[]>([])
  const [hoveredPoint, setHoveredPoint] = useState<any>(null)

  // Generate demo bets data
  useEffect(() => {
    const demoBets: Bet[] = [
      { id: '1', timeHours: 2, price: currentPrice + 0.005, stake: 100, minPrice: currentPrice - 0.01, maxPrice: currentPrice + 0.02 },
      { id: '2', timeHours: 4, price: currentPrice - 0.003, stake: 50, minPrice: currentPrice - 0.015, maxPrice: currentPrice + 0.01 },
      { id: '3', timeHours: 6, price: currentPrice + 0.008, stake: 200, minPrice: currentPrice - 0.005, maxPrice: currentPrice + 0.025 },
      { id: '4', timeHours: 8, price: currentPrice - 0.002, stake: 75, minPrice: currentPrice - 0.02, maxPrice: currentPrice + 0.005 },
      { id: '5', timeHours: 12, price: currentPrice + 0.012, stake: 150, minPrice: currentPrice - 0.008, maxPrice: currentPrice + 0.03 },
      { id: '6', timeHours: 16, price: currentPrice - 0.006, stake: 80, minPrice: currentPrice - 0.025, maxPrice: currentPrice + 0.008 },
      { id: '7', timeHours: 20, price: currentPrice + 0.015, stake: 300, minPrice: currentPrice - 0.012, maxPrice: currentPrice + 0.035 },
      { id: '8', timeHours: 3, price: currentPrice + 0.003, stake: 120, minPrice: currentPrice - 0.008, maxPrice: currentPrice + 0.015 },
      { id: '9', timeHours: 10, price: currentPrice + 0.007, stake: 90, minPrice: currentPrice - 0.012, maxPrice: currentPrice + 0.022 },
      { id: '10', timeHours: 14, price: currentPrice - 0.001, stake: 60, minPrice: currentPrice - 0.018, maxPrice: currentPrice + 0.012 },
    ]
    setBets(demoBets)
  }, [currentPrice])

  // Calculate 2D probability density using kernel density estimation
  const probabilityDensity = useMemo(() => {
    const timePoints = 24 // 24 hours
    const priceRange = 0.1 // ±5% price range
    const priceSteps = 50 // 50 price points
    const bandwidth = 2 // Kernel bandwidth for smoothing

    const data = []
    
    for (let hour = 0; hour < timePoints; hour++) {
      for (let priceStep = 0; priceStep < priceSteps; priceStep++) {
        const price = currentPrice - priceRange/2 + (priceRange * priceStep / priceSteps)
        
        // Calculate kernel density estimation
        let density = 0
        let totalWeight = 0
        
        bets.forEach(bet => {
          // Calculate distance from this point to the bet
          const timeDistance = Math.abs(hour - bet.timeHours)
          const priceDistance = Math.abs(price - bet.price)
          
          // Use Gaussian kernel for both time and price dimensions
          const timeKernel = Math.exp(-(timeDistance * timeDistance) / (2 * bandwidth * bandwidth))
          const priceKernel = Math.exp(-(priceDistance * priceDistance) / (2 * bandwidth * bandwidth))
          
          // Combined kernel weight
          const kernelWeight = timeKernel * priceKernel
          
          // Weight by stake size
          const weightedDensity = kernelWeight * bet.stake
          density += weightedDensity
          totalWeight += bet.stake
        })
        
        // Normalize density
        const normalizedDensity = totalWeight > 0 ? density / totalWeight : 0
        
        data.push({
          timeHours: hour,
          price: price,
          density: normalizedDensity
        })
      }
    }

    return data
  }, [bets, currentPrice])

  // Create time-series data for the area chart with density bands
  const chartData = useMemo(() => {
    const timePoints = 24
    const data = []
    
    for (let hour = 0; hour < timePoints; hour++) {
      const hourData = probabilityDensity.filter(d => d.timeHours === hour)
      if (hourData.length === 0) continue
      
      const maxDensity = Math.max(...hourData.map(d => d.density))
      
      // Create density bands for the gradient effect
      const bands = [0.9, 0.7, 0.5, 0.3, 0.1].map(level => level * maxDensity)
      
      const point: any = { timeHours: hour }
      
      bands.forEach((threshold, index) => {
        const highDensityPoints = hourData.filter(d => d.density >= threshold)
        if (highDensityPoints.length > 0) {
          const minPrice = Math.min(...highDensityPoints.map(d => d.price))
          const maxPrice = Math.max(...highDensityPoints.map(d => d.price))
          point[`band${index}`] = maxPrice
          point[`band${index}Min`] = minPrice
          point[`band${index}Mid`] = (minPrice + maxPrice) / 2
          point[`band${index}Width`] = maxPrice - minPrice
        }
      })
      
      data.push(point)
    }
    
    return data
  }, [probabilityDensity])

  // Calculate high-confidence zones (>75% cumulative density)
  const highConfidenceZones = useMemo(() => {
    const zones = []
    const timePoints = 24

    for (let hour = 0; hour < timePoints; hour++) {
      const hourData = probabilityDensity.filter(d => d.timeHours === hour)
      if (hourData.length === 0) continue

      // Sort by density
      hourData.sort((a, b) => b.density - a.density)
      
      // Calculate total density for this hour
      const totalDensity = hourData.reduce((sum, point) => sum + point.density, 0)
      
      // Find 75% cumulative density threshold
      let cumulative = 0
      let threshold = 0
      for (const point of hourData) {
        cumulative += point.density / totalDensity
        if (cumulative >= 0.75) {
          threshold = point.density
          break
        }
      }

      // Find price range for high confidence
      const highConfPoints = hourData.filter(d => d.density >= threshold)
      if (highConfPoints.length > 0) {
        const minPrice = Math.min(...highConfPoints.map(d => d.price))
        const maxPrice = Math.max(...highConfPoints.map(d => d.price))
        zones.push({
          timeHours: hour,
          minPrice,
          maxPrice,
          confidence: threshold
        })
      }
    }

    return zones
  }, [probabilityDensity])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-dark-slate text-light-gray p-3 rounded-lg border border-dark-slate shadow-lg">
          <p className="font-medium">Time: {data.timeHours}h from now</p>
          <p className="text-sm">Price: ${data.price?.toFixed(4) || 'N/A'}</p>
          {data.density && (
            <p className="text-sm">Density: {(data.density * 100).toFixed(2)}%</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className={cn("w-full h-80", className)}>
      <div className="text-sm text-medium-gray mb-2">
        2D Probability Density Distribution (Kernel Density Estimation)
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onMouseMove={(e) => {
            if (e.activePayload && e.activePayload[0]) {
              setHoveredPoint(e.activePayload[0].payload)
            }
          }}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="densityGradient0" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id="densityGradient1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.7}/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.5}/>
            </linearGradient>
            <linearGradient id="densityGradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5}/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.3}/>
            </linearGradient>
            <linearGradient id="densityGradient3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="densityGradient4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.1}/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34C759" stopOpacity={0.5}/>
              <stop offset="100%" stopColor="#34C759" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#1C1C1E" />
          
          <XAxis 
            dataKey="timeHours" 
            stroke="#8E8E93"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Hours from now', position: 'bottom', offset: 0 }}
            domain={[0, 23]}
          />
          
          <YAxis 
            stroke="#8E8E93"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 0.01', 'dataMax + 0.01']}
            tickFormatter={(value) => `$${value.toFixed(3)}`}
            label={{ value: 'Price (USD)', angle: -90, position: 'left' }}
          />
          
          <Tooltip content={<CustomTooltip />} />

          {/* High confidence zones */}
          {highConfidenceZones.map((zone, index) => (
            <ReferenceArea
              key={index}
              x1={zone.timeHours - 0.5}
              x2={zone.timeHours + 0.5}
              y1={zone.minPrice}
              y2={zone.maxPrice}
              fill="url(#confidenceGradient)"
              fillOpacity={0.3}
            />
          ))}

          {/* Density areas with gradient effect - creating 2D probability density visualization */}
          <Area
            type="monotone"
            dataKey={(data) => data.band4 || currentPrice}
            stroke="none"
            fill="url(#densityGradient4)"
            fillOpacity={0.1}
            stackId="density4"
            baseLine={currentPrice - 0.05}
          />
          <Area
            type="monotone"
            dataKey={(data) => data.band3 || currentPrice}
            stroke="none"
            fill="url(#densityGradient3)"
            fillOpacity={0.2}
            stackId="density3"
            baseLine={currentPrice - 0.05}
          />
          <Area
            type="monotone"
            dataKey={(data) => data.band2 || currentPrice}
            stroke="none"
            fill="url(#densityGradient2)"
            fillOpacity={0.3}
            stackId="density2"
            baseLine={currentPrice - 0.05}
          />
          <Area
            type="monotone"
            dataKey={(data) => data.band1 || currentPrice}
            stroke="none"
            fill="url(#densityGradient1)"
            fillOpacity={0.4}
            stackId="density1"
            baseLine={currentPrice - 0.05}
          />
          <Area
            type="monotone"
            dataKey={(data) => data.band0 || currentPrice}
            stroke="none"
            fill="url(#densityGradient0)"
            fillOpacity={0.5}
            stackId="density0"
            baseLine={currentPrice - 0.05}
          />

          {/* Individual bets as red lines */}
          {bets.map((bet, index) => (
            <Line
              key={bet.id}
              type="monotone"
              data={[{ timeHours: bet.timeHours, price: bet.price }]}
              dataKey="price"
              stroke="#FF2D55"
              strokeWidth={2}
              strokeOpacity={Math.min(bet.stake / 100, 1)}
              dot={{ fill: '#FF2D55', strokeWidth: 2, r: 4 }}
              connectNulls={false}
            />
          ))}

          {/* Current price reference line */}
          <Line
            type="monotone"
            data={Array.from({ length: 24 }, (_, i) => ({ timeHours: i, price: currentPrice }))}
            dataKey="price"
            stroke="#34C759"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded opacity-60"></div>
          <span className="text-medium-gray">Probability Density</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded opacity-40"></div>
          <span className="text-medium-gray">High Confidence (&gt;75%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-medium-gray">Individual Bets</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-medium-gray">Current Price</span>
        </div>
      </div>
    </div>
  )
} 
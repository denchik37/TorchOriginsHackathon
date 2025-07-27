"use client"

import React, { useState, useMemo } from 'react'
import { Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { cn } from '@/lib/utils'

interface KDEChartProps {
  data: Array<{
    date: string
    price: number
    confidence: number
  }>
  currentPrice: number
  className?: string
}

export function KDEChart({ data, currentPrice, className }: KDEChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string
    price: number
    confidence: number
  } | null>(null)

  const chartData = useMemo(() => {
    return data.map((point, index) => ({
      ...point,
      index,
      // Create a heatmap effect by varying opacity based on confidence
      opacity: point.confidence / 100,
    }))
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-black/90 text-white p-3 rounded-lg border border-gray-600 shadow-lg">
          <p className="font-medium">Date: {data.date}</p>
          <p className="text-sm">Price: ${data.price.toFixed(4)}</p>
          <p className="text-sm">Confidence: {data.confidence}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={cn("w-full h-64", className)}>
      <div className="text-sm text-muted-foreground mb-2">
        Hover to see confidence
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
            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 0.01', 'dataMax + 0.01']}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#colorConfidence)"
            fillOpacity={0.6}
          />
          {/* Current price line */}
          <Area
            type="monotone"
            dataKey={() => currentPrice}
            stroke="#EF4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="none"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Confidence indicator */}
      {hoveredPoint && (
        <div className="mt-2 p-2 bg-muted rounded text-sm">
          <div className="flex justify-between">
            <span>Confidence</span>
            <span className="font-medium">{hoveredPoint.confidence}%</span>
          </div>
        </div>
      )}
    </div>
  )
} 
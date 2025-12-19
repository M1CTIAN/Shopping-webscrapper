'use client'

import React from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { extractNumericPrice } from '../utils/priceUtils'

interface MiniPriceChartProps {
  priceHistory?: Array<{
    price: string
    timestamp: string
    change_type?: string
  }>
  className?: string
}

export default function MiniPriceChart({ priceHistory, className = '' }: MiniPriceChartProps) {
  if (!priceHistory || priceHistory.length < 2) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-xs text-gray-400">No trend data</div>
      </div>
    )
  }

  // Convert price history to chart data
  const chartData = priceHistory.map((entry, index) => ({
    index,
    price: extractNumericPrice(entry.price),
    changeType: entry.change_type
  })).filter(item => item.price > 0)

  if (chartData.length < 2) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-xs text-gray-400">Insufficient data</div>
      </div>
    )
  }

  // Determine trend color
  const firstPrice = chartData[0].price
  const lastPrice = chartData[chartData.length - 1].price
  const isDecreasing = lastPrice < firstPrice
  const lineColor = isDecreasing ? '#10B981' : '#EF4444' // green for decrease (good), red for increase

  return (
    <div className={`${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
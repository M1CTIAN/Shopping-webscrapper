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
      // FIX 1: Removed weird characters, fixed 'lex' to 'flex', and added backticks
      <div className={`flex items-center justify-center ${className}`}>
        <div className='text-xs text-slate-500'>No trend data</div>
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
      // FIX 2: Same fix here - added backticks and fixed 'flex'
      <div className={`flex items-center justify-center ${className}`}>
        <div className='text-xs text-slate-500'>Insufficient data</div>
      </div>
    )
  }

  // Determine trend color
  const firstPrice = chartData[0].price
  const lastPrice = chartData[chartData.length - 1].price
  const isDecreasing = lastPrice < firstPrice
  const lineColor = isDecreasing ? '#10B981' : '#F43F5E' // emerald-500 for decrease (good), rose-500 for increase

  return (
    // FIX 3: Fixed invalid syntax {${className}} -> {className}
    <div className={className}>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={chartData}>
          <Line 
            type='monotone' 
            dataKey='price' 
            stroke={lineColor} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
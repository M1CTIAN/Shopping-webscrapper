'use client'

import React from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts'
import { PriceHistoryEntry } from '../types/product'

interface PriceChartProps {
  priceHistory: PriceHistoryEntry[]
}

interface ChartDataPoint {
  date: string
  price: number
  changeType: string
  originalPrice: string
  timestamp: string
  formattedDate: string
}

export default function PriceChart({ priceHistory }: PriceChartProps) {
  // Convert price history to chart data
  const chartData: ChartDataPoint[] = priceHistory.map((entry) => {
    // Extract numeric price from string (remove currency symbols, commas, etc.)
    const numericPrice = parseFloat(
      entry.price.replace(/[^\d.-]/g, '').replace(/,/g, '') || '0'
    )
    
    // Format date for display
    const date = new Date(entry.timestamp)
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: numericPrice,
      changeType: 'neutral', // You could calculate this based on previous price
      originalPrice: entry.price,
      timestamp: entry.timestamp,
      formattedDate
    }
  })

  if (chartData.length === 0) {
    return (
      <div className='bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-slate-800 text-center'>
        <p className='text-slate-400'>No price history available yet.</p>
      </div>
    )
  }

  const minPrice = Math.min(...chartData.map(d => d.price))
  const maxPrice = Math.max(...chartData.map(d => d.price))
  const padding = (maxPrice - minPrice) * 0.1

  return (
    <div className='bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-slate-800'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h3 className='text-xl font-bold text-white flex items-center gap-2'>
            <svg className='w-5 h-5 text-blue-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' />
            </svg>
            Price History
          </h3>
          <p className='text-slate-400 text-sm mt-1'>Tracking price changes over time</p>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-blue-500'></div>
            <span className='text-xs text-slate-400'>Price Trend</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500'></div>
            <span className='text-xs text-slate-400'>Lowest Price</span>
          </div>
        </div>
      </div>
      
      <div className='h-[400px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id='colorPrice' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3}/>
                <stop offset='95%' stopColor='#3b82f6' stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#1e293b' vertical={false} />
            <XAxis 
              dataKey='date' 
              stroke='#64748b'
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke='#64748b'
              tick={{ fill: '#64748b', fontSize: 12 }}
               tickFormatter={(value) => `₹${value.toLocaleString()}`}
              domain={[minPrice - padding, maxPrice + padding]}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: '#1e293b',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                color: '#f8fafc'
              }}
              itemStyle={{ color: '#3b82f6' }}
               formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Price']}
              labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
            />
            <Area 
              type='monotone' 
              dataKey='price' 
              stroke='#3b82f6' 
              strokeWidth={3}
              fillOpacity={1} 
              fill='url(#colorPrice)' 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#60a5fa' }}
            />
            <ReferenceLine y={minPrice} stroke='#10b981' strokeDasharray='3 3' label={{ value: 'Lowest', position: 'right', fill: '#10b981', fontSize: 12 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

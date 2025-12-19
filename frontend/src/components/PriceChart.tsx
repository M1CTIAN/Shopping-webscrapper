'use client'

import React from 'react'
import {
  Line,
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
import { formatDisplayPrice } from '../utils/priceUtils'

interface PriceChartProps {
  priceHistory: PriceHistoryEntry[]
  currentPrice: string
  productName: string
}

interface ChartDataPoint {
  date: string
  price: number
  changeType: string
  originalPrice: string
  timestamp: string
  formattedDate: string
}

export default function PriceChart({ priceHistory, currentPrice, productName }: PriceChartProps) {
  // Convert price history to chart data
  const chartData: ChartDataPoint[] = priceHistory.map((entry, index) => {
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
      date: `Point ${index + 1}`,
      price: numericPrice,
      changeType: entry.change_type || 'unknown',
      originalPrice: entry.price,
      timestamp: entry.timestamp,
      formattedDate
    }
  })

  // Calculate price statistics
  const prices = chartData.map(d => d.price).filter(p => p > 0)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice
  
  // Current price as number
  const currentPriceNum = parseFloat(
    currentPrice.replace(/[^\d.-]/g, '').replace(/,/g, '') || '0'
  )

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataPoint }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint
      return (
        <div className="bg-slate-800 p-4 border border-slate-700 rounded-lg shadow-lg">
          <p className="font-semibold text-white">{data.formattedDate}</p>
          <p className="text-lg font-bold text-green-400">{formatDisplayPrice(data.originalPrice)}</p>
          <p className="text-sm text-slate-400 capitalize">
            {data.changeType === 'initial' ? 'First recorded price' : 
             data.changeType === 'increase' ? '↗️ Price increased' :
             data.changeType === 'decrease' ? '↘️ Price dropped' :
             data.changeType === 'same' ? '→ No change' : 'Price update'}
          </p>
        </div>
      )
    }
    return null
  }

  // Custom dot renderer for different change types
  const CustomDot = (props: { cx?: number; cy?: number; payload?: ChartDataPoint }) => {
    const { cx, cy, payload } = props
    
    if (!cx || !cy || !payload) return null
    
    let fillColor = '#10B981' // default green
    
    switch (payload.changeType) {
      case 'increase':
        fillColor = '#EF4444' // red
        break
      case 'decrease':
        fillColor = '#10B981' // green
        break
      case 'initial':
        fillColor = '#3B82F6' // blue
        break
      default:
        fillColor = '#6B7280' // gray
    }
    
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={4} 
        fill={fillColor}
        stroke="#fff"
        strokeWidth={2}
      />
    )
  }

  if (!chartData.length || prices.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-white mb-4">Price History Chart</h3>
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <svg className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium">No Price Data Available</p>
          <p className="text-sm">Add more price checks to see the price trend.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Price History Chart</h3>
          <p className="text-sm text-slate-400">{productName}</p>
        </div>
        
        {/* Price Statistics */}
        <div className="flex gap-4 mt-4 lg:mt-0">
          <div className="text-center">
            <div className="text-sm text-slate-400">Current</div>
            <div className="text-lg font-bold text-blue-400">₹{currentPriceNum.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-400">Lowest</div>
            <div className="text-lg font-bold text-green-400">₹{minPrice.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-400">Highest</div>
            <div className="text-lg font-bold text-red-400">₹{maxPrice.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Chart Legend */}
      <div className="flex text-slate-300 flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span>Initial Price</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span>Price Drop</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span>Price Increase</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-slate-500 mr-2"></div>
          <span>No Change</span>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            
            <XAxis 
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            
            <YAxis 
              domain={['dataMin - 100', 'dataMax + 100']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={(value) => `₹${value.toLocaleString()}`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference line for current price */}
            <ReferenceLine 
              y={currentPriceNum} 
              stroke="#3B82F6" 
              strokeDasharray="5 5"
              label={{ value: "Current Price", fill: "#94a3b8" }}
            />
            
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10B981"
              strokeWidth={3}
              fill="url(#priceGradient)"
            />
            
            <Line
              type="monotone"
              dataKey="price"
              stroke="#10B981"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Price Change Summary */}
      {chartData.length > 1 && (
        <div className="mt-6 p-6 bg-slate-700 rounded-xl shadow-lg border border-slate-600">
          <h4 className="font-bold text-white mb-4 text-lg">Price Change Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base">
            <div>
              <span className="text-slate-300 font-semibold">Total Tracking Period:</span>
              <span className="ml-2 font-bold text-white">
                {Math.ceil((new Date(chartData[chartData.length - 1].timestamp).getTime() - 
                           new Date(chartData[0].timestamp).getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
            <div>
              <span className="text-slate-300 font-semibold">Price Range:</span>
              <span className="ml-2 font-bold text-green-400">₹{priceRange.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
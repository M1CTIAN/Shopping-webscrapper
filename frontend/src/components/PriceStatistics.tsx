'use client'

import React from 'react'
import { ProductDetail } from '../types/product'
import { extractNumericPrice, getBestPrices, getPriceTrend } from '../utils/priceUtils'

interface PriceStatisticsProps {
  product: ProductDetail
}

export default function PriceStatistics({ product }: PriceStatisticsProps) {
  const priceHistory = product.price_history || []
  const currentPriceNum = extractNumericPrice(product.current_price)
  
  if (priceHistory.length === 0) {
    return null
  }

  // Get best prices
  const { lowest, highest } = getBestPrices(priceHistory)
  
  // FIX: Add this check. If lowest or highest are missing, stop rendering.
  // This satisfies TypeScript that they are not null later in the code.
  if (!lowest || !highest) {
    return null
  }

  // Get trend analysis
  const trend = getPriceTrend(priceHistory)
  
  // Calculate savings
  const firstPriceNum = priceHistory.length > 0 ? extractNumericPrice(priceHistory[0].price) : currentPriceNum
  const savings = firstPriceNum - currentPriceNum
  
  // Price volatility (standard deviation)
  const prices = priceHistory.map(entry => extractNumericPrice(entry.price)).filter(p => p > 0)
  const avgPrice = prices.length > 0 
    ? prices.reduce((sum, price) => sum + price, 0) / prices.length 
    : 0

  return (
    <div className='bg-slate-900/50 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-slate-800'>
      <h3 className='text-xl font-bold text-white mb-6 flex items-center gap-2'>
        <svg className='w-5 h-5 text-blue-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
        </svg>
        Price Analysis
      </h3>
      
      {/* Main Statistics Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
        {/* Current vs First Price */}
        <div className='bg-slate-800/50 rounded-xl p-5 border border-slate-700/50'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-slate-400'>Price Change</span>
            {savings > 0 ? (
              <svg className='h-5 w-5 text-emerald-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 17h8m0 0V9m0 8l-8-8-4 4-6 6' />
              </svg>
            ) : savings < 0 ? (
              <svg className='h-5 w-5 text-rose-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
              </svg>
            ) : (
              <svg className='h-5 w-5 text-slate-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 12h14' />
              </svg>
            )}
          </div>
          <div className='text-2xl font-bold text-slate-200'>
            {savings > 0 ? '-' : ''}{Math.abs(savings).toLocaleString()}
          </div>
          <div className='text-xs text-slate-500 mt-1'>
            {savings > 0 ? 'Saved since tracking started' : savings < 0 ? 'Increased since tracking started' : 'No change since tracking started'}
          </div>
        </div>

        {/* Lowest Price */}
        <div className='bg-slate-800/50 rounded-xl p-5 border border-slate-700/50'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-slate-400'>Lowest Price</span>
            <svg className='h-5 w-5 text-blue-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 14l-7 7m0 0l-7-7m7 7V3' />
            </svg>
          </div>
          <div className='text-2xl font-bold text-slate-200'>
            {lowest.price.toLocaleString()}
          </div>
          <div className='text-xs text-slate-500 mt-1'>
            Recorded on {new Date(lowest.date).toLocaleDateString()}
          </div>
        </div>

        {/* Highest Price */}
        <div className='bg-slate-800/50 rounded-xl p-5 border border-slate-700/50'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-slate-400'>Highest Price</span>
            <svg className='h-5 w-5 text-rose-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 10l7-7m0 0l7 7m-7-7v18' />
            </svg>
          </div>
          <div className='text-2xl font-bold text-slate-200'>
            {highest.price.toLocaleString()}
          </div>
          <div className='text-xs text-slate-500 mt-1'>
            Recorded on {new Date(highest.date).toLocaleDateString()}
          </div>
        </div>

        {/* Average Price */}
        <div className='bg-slate-800/50 rounded-xl p-5 border border-slate-700/50'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-slate-400'>Average Price</span>
            <svg className='h-5 w-5 text-amber-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
            </svg>
          </div>
          <div className='text-2xl font-bold text-slate-200'>
            {Math.round(avgPrice).toLocaleString()}
          </div>
          <div className='text-xs text-slate-500 mt-1'>
            Based on {priceHistory.length} data points
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className='rounded-xl p-4 border border-slate-700/50 bg-slate-800/30'>
        <div className='flex items-start gap-3'>
          <div className='p-2 rounded-lg bg-slate-700/50 text-slate-300'>
            <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          </div>
          <div>
            <h4 className='font-bold text-slate-200'>
              {currentPriceNum <= lowest.price 
                ? 'Best Time to Buy!' 
                : currentPriceNum > avgPrice 
                  ? 'Price is High' 
                  : 'Fair Price'}
            </h4>
            <p className='text-slate-300 text-sm mt-1'>
              {currentPriceNum <= lowest.price 
                ? 'The current price is at its lowest recorded point. This is a great deal!' 
                : currentPriceNum > avgPrice 
                  ? 'The price is above average. You might want to wait for a drop.' 
                  : 'The price is close to the average. Consider buying if you need it now.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
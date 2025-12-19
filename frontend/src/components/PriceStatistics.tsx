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
  
  // Get trend analysis
  const trend = getPriceTrend(priceHistory)
  
  // Calculate savings
  const firstPriceNum = priceHistory.length > 0 ? extractNumericPrice(priceHistory[0].price) : currentPriceNum
  const savings = firstPriceNum - currentPriceNum
  const savingsPercent = firstPriceNum > 0 ? (savings / firstPriceNum) * 100 : 0

  // Price volatility (standard deviation)
  const prices = priceHistory.map(entry => extractNumericPrice(entry.price)).filter(p => p > 0)
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length
  const volatility = Math.sqrt(variance)

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-8 mb-8 border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-6">Price Analysis</h3>
      
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Current vs First Price */}
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Price Change</span>
            {savings > 0 ? (
              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
              </svg>
            ) : savings < 0 ? (
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            )}
          </div>
          <div className={`text-lg font-bold ${
            savings > 0 ? 'text-green-400' : savings < 0 ? 'text-red-400' : 'text-slate-400'
          }`}>
            {savings > 0 ? '↓' : savings < 0 ? '↑' : '='} ₹{Math.abs(savings).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">
            {savingsPercent > 0 ? `${savingsPercent.toFixed(1)}% savings` : 
             savingsPercent < 0 ? `${Math.abs(savingsPercent).toFixed(1)}% increase` : 
             'No change from first price'}
          </div>
        </div>

        {/* Best Price Found */}
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Best Price</span>
            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-lg font-bold text-green-400">
            ₹{lowest?.price.toLocaleString() || 'N/A'}
          </div>
          <div className="text-xs text-slate-400">
            {lowest ? `on ${lowest.date}` : 'No data available'}
          </div>
        </div>

        {/* Price Volatility */}
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Volatility</span>
            <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="text-lg font-bold text-yellow-400">
            ₹{volatility.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-slate-400">
            {volatility < 50 ? 'Very stable' : 
             volatility < 100 ? 'Moderately stable' :
             volatility < 200 ? 'Somewhat volatile' : 'Highly volatile'}
          </div>
        </div>

        {/* Price Trend */}
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Trend</span>
            {trend.direction === 'increasing' ? (
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : trend.direction === 'decreasing' ? (
              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            )}
          </div>
          <div className={`text-lg font-bold ${
            trend.direction === 'increasing' ? 'text-red-400' :
            trend.direction === 'decreasing' ? 'text-green-400' : 'text-slate-400'
          }`}>
            {trend.direction === 'increasing' ? '↗ Rising' :
             trend.direction === 'decreasing' ? '↘ Falling' : '→ Stable'}
          </div>
          <div className="text-xs text-slate-400 capitalize">
            {trend.strength.toFixed(1)}% strength
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="border-t border-slate-700 pt-6">
        <h4 className="font-semibold text-white mb-3">Price Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <h5 className="font-medium text-slate-200 mb-2">Tracking Summary</h5>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Average price: ₹{avgPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</li>
              <li>• Price range: ₹{((highest?.price || 0) - (lowest?.price || 0)).toLocaleString()}</li>
            </ul>
          </div>
          
          <div className="bg-slate-700 rounded-lg p-4">
            <h5 className="font-medium text-slate-200 mb-2">Recommendations</h5>
            <div className="text-sm text-slate-300 space-y-1">
              {currentPriceNum === lowest?.price && (
                <div className="text-green-400 font-medium">🎉 Currently at lowest recorded price!</div>
              )}
              {currentPriceNum === highest?.price && (
                <div className="text-red-400 font-medium">⚠️ Currently at highest recorded price</div>
              )}
              {trend.direction === 'decreasing' && (
                <div className="text-green-400">📈 Price is trending downward - good time to buy</div>
              )}
              {trend.direction === 'increasing' && (
                <div className="text-yellow-400">📉 Price is trending upward - consider waiting</div>
              )}
              {volatility > 100 && (
                <div className="text-blue-400">🔄 Price is volatile - check frequently for deals</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
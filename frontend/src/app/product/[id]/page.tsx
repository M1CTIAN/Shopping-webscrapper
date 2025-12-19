'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProductDetail } from '../../../types/product'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://shopping-webscrapper.onrender.com'
import { formatDate, getProductName, getWebsiteName, getWebsiteColor, getProductImage } from '../../../utils/productUtils'
import { formatDisplayPrice } from '../../../utils/priceUtils'
import PriceChart from '../../../components/PriceChart'
import PriceStatistics from '../../../components/PriceStatistics'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProductDetails = useCallback(async () => {
    if (!productId) {
      setError('Invalid product ID')
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/product/${productId}`)
      
      if (!response.ok) {
        throw new Error('Product not found')
      }

      const data = await response.json()
      setProduct(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchProductDetails()
  }, [productId, fetchProductDetails])

  // price change helpers removed (unused)

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-red-400 bg-red-900/30 border border-red-800'
      case 'decreasing': return 'text-green-400 bg-green-900/30 border border-green-800'
      default: return 'text-slate-400 bg-slate-700 border border-slate-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-slate-800 rounded-xl shadow-lg p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                  <div className="w-full h-80 bg-slate-700 rounded-lg"></div>
                </div>
                <div className="lg:w-2/3 space-y-4">
                  <div className="h-8 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-6 bg-slate-700 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
            <p className="text-slate-400 mb-6">{error || 'The product cannot be found.'}</p>
            <button 
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button 
          onClick={() => router.push('/')}
          className="flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>

        {/* Product Header */}
        <div className="bg-slate-800 rounded-xl shadow-lg p-8 mb-8 border border-slate-700">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Product Image */}
            <div className="lg:w-1/3">
              <div className="relative">
                <img
                  src={getProductImage(product)}
                  alt={getProductName(product)}
                  className="w-full h-80 object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getWebsiteColor(product.clean_url)}`}>
                    {getWebsiteName(product.clean_url)}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:w-2/3">
              <h1 className="text-3xl font-bold text-white mb-4">
                {getProductName(product)}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-green-400">
                  {formatDisplayPrice(product.current_price)}
                </span>
                {product.stats && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(product.stats.price_trend)}`}>
                    {product.stats.price_trend} trend
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {product.stats?.lowest_price ? `₹${product.stats.lowest_price.toLocaleString()}` : 'N/A'}
                  </div>
                  <div className="text-sm text-slate-300">Lowest Price</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {product.stats?.highest_price ? `₹${product.stats.highest_price.toLocaleString()}` : 'N/A'}
                  </div>
                  <div className="text-sm text-slate-300">Highest Price</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <a
                  href={product.clean_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  View on {getWebsiteName(product.clean_url)}
                </a>
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                  Track Price
                </button>
              </div>

              {/* Product Details */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
                  <div>
                    <span className="font-medium text-slate-300">Added:</span> {formatDate(product.added_at)}
                  </div>
                  <div>
                    <span className="font-medium text-slate-300">Last Updated:</span> {formatDate(product.last_updated)}
                  </div>
                  <div>
                    <span className="font-medium text-slate-300">Product ID:</span> {product.product_id}
                  </div>
                  <div>
                    <span className="font-medium text-slate-300">Tracking Since:</span> {formatDate(product.added_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Statistics */}
        <PriceStatistics product={product} />

        {/* Price Chart */}
        <PriceChart 
          priceHistory={product.price_history}
        />
      </div>
    </div>
  )
}
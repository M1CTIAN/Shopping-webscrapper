'use client'

import { Product } from '../types/product'
import { formatDate, getProductName, getWebsiteName, getWebsiteColor, getProductImage } from '../utils/productUtils'
import { formatDisplayPrice } from '../utils/priceUtils'
import { useRouter } from 'next/navigation'
import MiniPriceChart from './MiniPriceChart'

interface ProductCardProps {
  product: Product
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

export default function ProductCard({ product, onImageError }: ProductCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/product/${product.id}`)
  }

  const getPriceChangeIndicator = (priceChanges: number) => {
    if (priceChanges === 0) return null
    return (
      <div className="flex items-center mt-1">
        <svg className="h-3 w-3 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span className="text-xs text-blue-600 font-medium">
          {priceChanges} update{priceChanges !== 1 ? 's' : ''}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-slate-700">
      {/* Clickable Product Image and Info */}
      <div onClick={handleCardClick}>
        {/* Product Image */}
        <div className="relative h-48 bg-slate-700">
          <img
            src={getProductImage(product)}
            alt={getProductName(product)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={onImageError}
          />
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWebsiteColor(product.clean_url)}`}>
              {getWebsiteName(product.clean_url)}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-5">
          <h4 className="text-lg font-semibold text-white mb-2 line-clamp-2 min-h-[3.5rem]">
            {getProductName(product)}
          </h4>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <span className="text-2xl font-bold text-green-400">
                {formatDisplayPrice(product.current_price)}
              </span>
              {getPriceChangeIndicator(product.price_changes || 0)}
            </div>
            {/* Mini Price Chart */}
            {product.price_history && product.price_history.length > 1 && (
              <div className="w-20 h-10 ml-3">
                <MiniPriceChart 
                  priceHistory={product.price_history}
                  className="w-full h-full"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
            <span>Added {formatDate(product.added_at)}</span>
            <span>{product.total_checks || 1} check{(product.total_checks || 1) !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons - Non-clickable area */}
      <div className="px-5 pb-5">
        <div className="flex space-x-3">
          <a
            href={product.clean_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={(e) => e.stopPropagation()} // Prevent card click when clicking button
          >
            View Product
          </a>
          <button 
            className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation() // Prevent card click when clicking button
              handleCardClick() // Navigate to details page
            }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
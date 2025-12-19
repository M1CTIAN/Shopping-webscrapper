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
      <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
        <svg className="h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wide">
          {priceChanges} update{priceChanges !== 1 ? 's' : ''}
        </span>
      </div>
    )
  }

  return (
    <div 
      onClick={handleCardClick}
      className="group relative bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 hover:border-slate-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-slate-800/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 z-10" />
        <img
          src={getProductImage(product)}
          alt={getProductName(product)}
          className="w-full h-full object-contain p-6 mix-blend-normal group-hover:scale-110 transition-transform duration-500 ease-out"
          onError={onImageError}
        />
        
        {/* Website Badge */}
        <div className="absolute top-3 right-3 z-20">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/10`}>
            {getWebsiteName(product.clean_url)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4 flex-grow">
          <h4 className="text-base font-medium text-slate-200 leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors duration-200 min-h-[2.5rem]">
            {getProductName(product)}
          </h4>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-medium mb-0.5">Current Price</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {formatDisplayPrice(product.current_price)}
                </span>
              </div>
            </div>
            {/* Mini Chart */}
            {product.price_history && product.price_history.length > 1 && (
              <div className="w-24 h-12 opacity-70 group-hover:opacity-100 transition-opacity">
                <MiniPriceChart 
                  priceHistory={product.price_history}
                  className="w-full h-full"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
            {getPriceChangeIndicator(product.price_changes || 0) || <div />}
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              {product.total_checks || 1} check{(product.total_checks || 1) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Action Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-30 bg-gradient-to-t from-slate-900 to-slate-900/90 backdrop-blur-sm border-t border-slate-700/50">
        <div className="flex gap-3">
          <a
            href={product.clean_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors text-center shadow-lg shadow-blue-900/20"
            onClick={(e) => e.stopPropagation()}
          >
            View Deal
          </a>
          <button 
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors border border-slate-700"
            onClick={(e) => {
              e.stopPropagation()
              // Add delete handler logic here if needed, or keep existing
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

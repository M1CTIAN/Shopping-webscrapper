// filepath: c:\Users\Arpit Raj\Desktop\College-stuff\Web Dev\Shopping webscrapper\frontend\src\components\ProductGrid.tsx
import { useState } from 'react'
import ProductCard from './ProductCard'
import { Product } from '../types/product'

interface ProductGridProps {
  products: Product[]
  loading: boolean
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

export default function ProductGrid({ products, loading, onImageError }: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6 // 4x4 grid

  if (loading) {
    return (
      <div className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden">
              <div className="aspect-[4/3] bg-slate-800/50 animate-pulse"></div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-4 bg-slate-800 rounded w-20 animate-pulse"></div>
                  <div className="h-6 bg-slate-800 rounded-full w-16 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 bg-slate-800 rounded w-full animate-pulse"></div>
                  <div className="h-6 bg-slate-800 rounded w-2/3 animate-pulse"></div>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <div className="h-8 bg-slate-800 rounded w-24 animate-pulse"></div>
                  <div className="h-8 bg-slate-800 rounded w-8 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-12 mb-12 text-center">
        <div className="text-slate-600 mb-6">
          <svg className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No products tracked yet</h3>
        <p className="text-slate-400 text-lg max-w-md mx-auto">Start tracking prices by adding your first product URL above.</p>
      </div>
    )
  }

  // Pagination logic
  const totalPages = Math.ceil(products.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {currentProducts.map((product) => (
          <ProductCard 
            key={product.product_id} 
            product={product} 
            onImageError={onImageError}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-2">
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              currentPage === 1
                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-lg hover:shadow-blue-900/20'
            }`}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 scale-110'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              currentPage === totalPages
                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-lg hover:shadow-blue-900/20'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
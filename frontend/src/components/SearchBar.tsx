'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '../types/product'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [urlError, setUrlError] = useState('')
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = () => {
    fetch('http://localhost:8000/products')
      .then(res => res.json())
      .then(data => setProducts(data.products))
      .catch(err => console.error('Failed to fetch products for search:', err))
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [wrapperRef])

  const isUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const isProductUrl = (url: string) => {
    const u = url.toLowerCase()
    // Amazon product (ASIN) patterns
    const amazonAsin = /(?:\/dp\/|\/gp\/product\/)([a-z0-9]{10})/i
    if (u.includes('amazon') && amazonAsin.test(url)) return true

    // Flipkart product
    const flipkartMatch = /\/p\/(itm[a-z0-9]+)/i
    if (u.includes('flipkart') && flipkartMatch.test(url)) return true

    // Myntra product (id/buy)
    const myntraMatch = /\/(\d+)\/buy/i
    if (u.includes('myntra') && myntraMatch.test(url)) return true

    return false
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    if (value.length > 0) {
      setIsOpen(true)
      const filtered = products.filter(product => 
        (product.product_name || '').toLowerCase().includes(value.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setIsOpen(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault()
    if (!query) return

    if (isUrl(query)) {
      // Validate it's a product link before attempting to track
      if (!isProductUrl(query)) {
        setUrlError('Please paste a direct product link from Amazon, Flipkart or Myntra.')
        return
      }
      setUrlError('')
      setIsTracking(true)
      try {
        const response = await fetch('http://localhost:8000/track-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: query }),
        })
        
        if (response.ok) {
          const data = await response.json()
          setQuery('')
          setIsOpen(false)
          // Refresh products list
          window.location.reload()
        }
      } catch (error) {
        console.error('Error tracking product:', error)
      } finally {
        setIsTracking(false)
      }
    } else {
      // Navigate to search results page or filter current view
      // For now, we'll just close the dropdown
      setIsOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className='relative w-full max-w-2xl mx-auto z-50'>
      <form onSubmit={handleSubmit} className="relative group">
        {/* ... (keep your existing form code here, it is fine) ... */}
        <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
          <svg className='h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
          </svg>
        </div>
        <input
          type='text'
          className='block w-full pl-12 pr-4 py-4 bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-2xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-lg shadow-black/20'
          placeholder='Paste product URL or search tracked products...'
          value={query}
          onChange={handleSearch}
        />
        <div className='absolute inset-y-0 right-0 pr-2 flex items-center'>
          <button
            type="submit"
            disabled={!query || isTracking}
            className={`p-2 rounded-xl transition-all duration-200 ${
              query 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isTracking ? (
              <svg className='animate-spin h-5 w-5' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
            ) : (
              <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 5l7 7m0 0l-7 7m7-7H3' />
              </svg>
            )}
          </button>
        </div>
      </form>

      {isOpen && (
        <div className='absolute mt-2 w-full bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200'>
          {isUrl(query) ? (
            <div className='p-4 hover:bg-slate-800/50 transition-colors cursor-pointer' onClick={handleSubmit}>
              <div className='flex items-center text-blue-400'>
                <svg className='h-5 w-5 mr-3' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
                <span className='font-medium'>Track new product from URL</span>
              </div>
              <p className='text-sm text-slate-500 mt-1 ml-8 truncate'>{query}</p>
              {urlError && <p className='text-xs text-rose-400 mt-2 ml-8'>{urlError}</p>}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className='max-h-96 overflow-y-auto custom-scrollbar'>
              {filteredProducts.map((product) => (
                <div
                  key={product.product_id}
                  onClick={() => {
                    router.push(`/product/${product.product_id}`)
                    setIsOpen(false)
                  }}
                  className='p-4 hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-800 last:border-0 flex items-center gap-4'
                >
                  <div className="h-12 w-12 bg-white rounded-lg p-1 flex-shrink-0">
                    <img 
                      src={product.image_url || '/placeholder.png'} 
                      // FIX: Changed product.name to product.product_name
                      alt={product.product_name || ''}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* FIX: Changed product.name to product.product_name */}
                    <h4 className="text-slate-200 font-medium truncate">{product.product_name || ''}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      {/* FIX: Removed the complex check. Since it's a string, just display it */}
                      <span className="text-blue-400 font-bold">₹{product.current_price}</span>
                      
                      {/* FIX: Derived website from clean_url because 'website' doesn't exist on your interface */}
                      <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                        {product.clean_url ? new URL(product.clean_url).hostname.replace('www.', '') : 'Site'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='p-8 text-center text-slate-500'>
              <p>No products found matching '{query}'</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

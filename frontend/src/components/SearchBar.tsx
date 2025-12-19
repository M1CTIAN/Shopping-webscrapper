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
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [wrapperRef])

  const isUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    if (value.length > 0) {
      const filtered = products.filter(product => 
        product.product_name?.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredProducts(filtered)
      setIsOpen(true)
    } else {
      setFilteredProducts([])
      setIsOpen(false)
    }
  }

  const handleTrackProduct = async () => {
    if (!isUrl(query)) return
    
    setIsTracking(true)
    try {
      const response = await fetch('http://localhost:8000/track-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: query }),
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(`Product tracked successfully: ${data.product_name || 'New Product'}`)
        setQuery('')
        setIsOpen(false)
        fetchProducts() // Refresh the list
        window.location.reload() // Reload to show new product in grid
      } else {
        const errorData = await response.json()
        alert(`Failed to track product: ${errorData.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error tracking product:', error)
      alert('Error tracking product. Please check console.')
    } finally {
      setIsTracking(false)
    }
  }

  const handleSelect = (productId: number) => {
    router.push(`/product/${productId}`)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search products or paste URL..."
          value={query}
          onChange={handleSearch}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isUrl(query)) {
              handleTrackProduct()
            }
          }}
        />
        <div className="absolute left-3 top-2.5 text-slate-400">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {isOpen && (filteredProducts.length > 0 || isUrl(query)) && (
        <div className="absolute z-10 w-full mt-1 bg-slate-800 rounded-md shadow-lg max-h-60 overflow-auto border border-slate-700">
          {isUrl(query) && (
            <div
              className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex items-center border-b border-slate-700 last:border-0 bg-blue-900/30"
              onClick={handleTrackProduct}
            >
              <div className="flex-shrink-0 h-10 w-10 mr-3 bg-blue-600 rounded flex items-center justify-center text-white">
                {isTracking ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {isTracking ? 'Tracking Product...' : 'Track this Product'}
                </div>
                <div className="text-xs text-blue-300 truncate">{query}</div>
              </div>
            </div>
          )}
          
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex items-center border-b border-slate-700 last:border-0"
              onClick={() => handleSelect(product.id)}
            >
              <div className="flex-shrink-0 h-10 w-10 mr-3 bg-slate-700 rounded overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt="" className="h-full w-full object-contain" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">?</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{product.product_name}</div>
                <div className="text-xs text-slate-400">{product.current_price}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

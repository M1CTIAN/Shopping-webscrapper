'use client'

import { useState, useEffect, useMemo } from 'react'
import Header from '../components/Header'
import ProductGrid from '../components/ProductGrid'
import Sidebar from '../components/Sidebar'
import { Product } from '../types/product'

// Helper to parse price string "3,599." -> 3599
const parsePrice = (priceStr: string) => {
  if (!priceStr) return 0
  const clean = priceStr.replace(/[^\d.]/g, '').replace(/\.$/, '')
  return parseFloat(clean) || 0
}

// Helper to categorize products
const getCategoryInfo = (product: Product) => {
  const name = product.product_name?.toLowerCase() || ''
  
  // Expanded keywords for Electronics
  const electronicsKeywords = [
    'mouse', 'keyboard', 'laptop', 'monitor', 'phone', 'mobile', 'smartphone', 
    'headphone', 'earbud', 'watch', 'tablet', 'ipad', 'iphone', 'android',
    'xiaomi', 'samsung', 'oneplus', 'pixel', 'realme', 'redmi', 'vivo', 'oppo', 'poco', 'iqoo', 'nothing',
    'tv', 'television', 'led', 'oled', 'qled', 'smart tv'
  ]
  
  if (electronicsKeywords.some(k => name.includes(k))) {
    let sub = 'Other'
    if (name.includes('mouse') || name.includes('keyboard')) sub = 'Accessories'
    else if (name.includes('laptop') || name.includes('macbook')) sub = 'Laptops'
    else if (name.includes('tv') || name.includes('television') || name.includes('monitor') || name.includes('led') || name.includes('oled') || name.includes('qled')) sub = 'TVs & Monitors'
    else if (name.includes('phone') || name.includes('mobile') || name.includes('smartphone') || 
             name.includes('iphone') || name.includes('android') || 
             name.includes('xiaomi') || name.includes('samsung') || name.includes('oneplus') || 
             name.includes('pixel') || name.includes('realme') || name.includes('redmi') || 
             name.includes('vivo') || name.includes('oppo') || name.includes('poco') || name.includes('iqoo') || name.includes('nothing')) sub = 'Phones'
    else if (name.includes('headphone') || name.includes('earbud') || name.includes('airpod') || name.includes('sony') || name.includes('jbl') || name.includes('boat')) sub = 'Audio'
    
    return { category: 'Electronics', subcategory: sub }
  }
  
  if (name.includes('shirt') || name.includes('pant') || name.includes('jeans') || name.includes('shoe') || name.includes('sneaker') || name.includes('hoodie') || name.includes('sweat') || name.includes('jacket') || name.includes('kurta')) {
    let sub = 'Other'
    if (name.includes('shirt') || name.includes('t-shirt') || name.includes('top') || name.includes('hoodie') || name.includes('sweat') || name.includes('jacket') || name.includes('kurta')) sub = 'Topwear'
    else if (name.includes('jeans') || name.includes('pant') || name.includes('trouser')) sub = 'Bottomwear'
    else if (name.includes('shoe') || name.includes('sneaker') || name.includes('sandal')) sub = 'Footwear'
    
    return { category: 'Fashion', subcategory: sub }
  }
  
  return { category: 'Other', subcategory: 'Other' }
}

const CATEGORIES = {
  'Electronics': ['Laptops', 'Phones', 'TVs & Monitors', 'Audio', 'Accessories'],
  'Fashion': ['Topwear', 'Bottomwear', 'Footwear'],
  'Other': []
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const [sortBy, setSortBy] = useState('newest')
  const [maxPrice, setMaxPrice] = useState(100000)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/products')
      if (response.ok) {
        const data = await response.json()
        const fetchedProducts = data.products.reverse()
        setProducts(fetchedProducts)
        
        // Calculate max price for slider
        const prices = fetchedProducts.map((p: Product) => parsePrice(p.current_price))
        const max = Math.max(...prices, 10000)
        setMaxPrice(max)
        setPriceRange([0, max])
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    target.src = `https://via.placeholder.com/300x200/e5e7eb/9ca3af?text=No+Image`
  }

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // 1. Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => {
        const { category, subcategory } = getCategoryInfo(p)
        if (selectedSubcategory) {
          return category === selectedCategory && subcategory === selectedSubcategory
        }
        return category === selectedCategory
      })
    }

    // 2. Price Filter
    result = result.filter(p => {
      const price = parsePrice(p.current_price)
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // 3. Sorting
    result.sort((a, b) => {
      const priceA = parsePrice(a.current_price)
      const priceB = parsePrice(b.current_price)
      const nameA = a.product_name?.toLowerCase() || ''
      const nameB = b.product_name?.toLowerCase() || ''

      switch (sortBy) {
        case 'price_asc': return priceA - priceB
        case 'price_desc': return priceB - priceA
        case 'name_asc': return nameA.localeCompare(nameB)
        case 'newest': 
        default:
          // Assuming products are already fetched in reverse chronological order or have added_at
          return new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
      }
    })

    return result
  }, [products, selectedCategory, selectedSubcategory, priceRange, sortBy])

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Tracked Products
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-slate-400">
            Monitor prices and get the best deals on your favorite items.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64 flex-shrink-0">
            <Sidebar 
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onSelectCategory={(cat, sub) => {
                setSelectedCategory(cat)
                setSelectedSubcategory(sub)
              }}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              minPrice={0}
              maxPrice={maxPrice}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <ProductGrid 
              products={filteredProducts} 
              loading={loading} 
              onImageError={handleImageError} 
            />
          </div>
        </div>
      </main>
    </div>
  )
}
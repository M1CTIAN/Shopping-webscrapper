import { useState } from 'react'

interface SidebarProps {
  categories: Record<string, string[]>
  selectedCategory: string
  selectedSubcategory: string
  onSelectCategory: (category: string, subcategory: string) => void
  priceRange: [number, number]
  setPriceRange: (range: [number, number]) => void
  minPrice: number
  maxPrice: number
  sortBy: string
  setSortBy: (sort: string) => void
}

export default function Sidebar({
  categories,
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  priceRange,
  setPriceRange,
  minPrice,
  maxPrice,
  sortBy,
  setSortBy
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className={`bg-slate-800 rounded-xl shadow-lg p-6 h-fit transition-all duration-300 ${isExpanded ? 'w-full md:w-64' : 'w-full md:w-20'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-bold text-white ${!isExpanded && 'hidden md:hidden'}`}>Filters</h2>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white md:hidden"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className={`${!isExpanded && 'hidden md:block'} space-y-8`}>
        {/* Sort By */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Sort By</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest Added</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Categories</h3>
          <div className="space-y-2">
            <div 
              className={`cursor-pointer px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === 'All' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
              onClick={() => onSelectCategory('All', '')}
            >
              All Products
            </div>
            
            {Object.entries(categories).map(([category, subcategories]) => (
              <div key={category} className="space-y-1">
                <div 
                  className={`cursor-pointer px-3 py-2 rounded-lg transition-colors font-medium ${
                    selectedCategory === category && !selectedSubcategory ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                  onClick={() => onSelectCategory(category, '')}
                >
                  {category}
                </div>
                
                {/* Subcategories */}
                {subcategories.length > 0 && (
                  <div className="pl-4 space-y-1 border-l-2 border-slate-700 ml-2">
                    {subcategories.map(sub => (
                      <div
                        key={sub}
                        className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          selectedSubcategory === sub ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-white'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectCategory(category, sub)
                        }}
                      >
                        {sub}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Price Range</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-slate-300">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex gap-2">
               <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-1/2 bg-slate-700 text-white rounded px-2 py-1 text-sm"
                placeholder="Min"
              />
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                className="w-1/2 bg-slate-700 text-white rounded px-2 py-1 text-sm"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

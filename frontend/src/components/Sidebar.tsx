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
    <div className={`bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 h-fit transition-all duration-300 ${isExpanded ? 'w-full md:w-72' : 'w-full md:w-20'}`}>
      <div className="flex justify-between items-center mb-8">
        <h2 className={`text-lg font-bold text-white flex items-center gap-2 ${!isExpanded && 'hidden md:hidden'}`}>
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters
        </h2>
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
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Sort By</h3>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-800/50 text-slate-200 rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer hover:bg-slate-800 transition-colors"
            >
              <option value="newest">Newest Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Categories</h3>
          <div className="space-y-1">
            <div 
              className={`cursor-pointer px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                selectedCategory === 'All' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              onClick={() => onSelectCategory('All', '')}
            >
              <span className="font-medium">All Products</span>
              {selectedCategory === 'All' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            
            {Object.entries(categories).map(([category, subcategories]) => (
              <div key={category} className="space-y-1">
                <div 
                  className={`cursor-pointer px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                    selectedCategory === category && !selectedSubcategory 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                  onClick={() => onSelectCategory(category, '')}
                >
                  <span className="font-medium">{category}</span>
                  {selectedCategory === category && !selectedSubcategory && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                
                {/* Subcategories */}
                {subcategories.length > 0 && selectedCategory === category && (
                  <div className="pl-4 space-y-1 ml-2 border-l border-slate-800 my-2">
                    {subcategories.map(sub => (
                      <div
                        key={sub}
                        className={`cursor-pointer px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${
                          selectedSubcategory === sub 
                            ? 'text-blue-400 bg-blue-500/10 font-medium' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectCategory(category, sub)
                        }}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${selectedSubcategory === sub ? 'bg-blue-400' : 'bg-slate-600'}`} />
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
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Price Range</h3>
          <div className="space-y-6 bg-slate-800/30 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs font-medium text-slate-400">
              <span>₹{priceRange[0].toLocaleString()}</span>
              <span>₹{priceRange[1].toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
            />
            <div className="flex gap-3">
               <div className="relative w-1/2">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                 <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="w-full bg-slate-900 text-white rounded-lg pl-6 pr-2 py-2 text-sm border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Min"
                />
               </div>
               <div className="relative w-1/2">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                 <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                  className="w-full bg-slate-900 text-white rounded-lg pl-6 pr-2 py-2 text-sm border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Max"
                />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

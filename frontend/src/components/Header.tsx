import Link from 'next/link'
import SearchBar from './SearchBar'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4 sm:gap-0">
          <div className="flex items-center flex-shrink-0 sm:mr-6 w-full sm:w-auto justify-between sm:justify-start">
            <Link href="/" className="group flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-violet-600 p-2 rounded-lg shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
                <span className="text-xl">🛒</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  PriceTracker
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                  Smart Shopping
                </span>
              </div>
            </Link>
          </div>
          
          <div className="flex-1 w-full sm:max-w-xl sm:mx-8">
            <SearchBar />
          </div>

          <nav className="flex space-x-1 flex-shrink-0 sm:flex">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2 rounded-full hover:bg-slate-800/50 transition-all duration-200 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
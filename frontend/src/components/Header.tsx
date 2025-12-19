import Link from 'next/link'
import SearchBar from './SearchBar'

export default function Header() {
  return (
    <header className="bg-slate-800 shadow-sm sticky top-0 z-50 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4 sm:gap-0">
          <div className="flex items-center flex-shrink-0 sm:mr-6 w-full sm:w-auto justify-between sm:justify-start">
            <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🛒</span>
              <span className="block">Price Tracker</span>
            </Link>
          </div>
          
          <div className="flex-1 w-full sm:max-w-xl sm:mx-4">
            <SearchBar />
          </div>

          <nav className="flex space-x-4 flex-shrink-0 sm:flex">
            <Link
              href="/dashboard"
              className="text-slate-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
export interface Product {
  id: number  // Unique numeric ID for routing
  product_id: string
  original_url: string
  clean_url: string
  current_price: string
  added_at: string
  last_updated: string
  total_checks?: number
  price_changes?: number
  product_name?: string
  image_url?: string
  price_history?: PriceHistoryEntry[]  // Optional for regular product list
}

export interface PriceHistoryEntry {
  price: string
  timestamp: string
  change_type?: 'initial' | 'increase' | 'decrease' | 'same' | 'unknown'
  previous_price?: string
}

export interface ProductDetail extends Product {
  price_history: PriceHistoryEntry[]
  stats?: {
    product_id: string
    total_checks: number
    price_changes: number
    current_price: string
    first_price?: string
    lowest_price?: number
    highest_price?: number
    price_trend: 'increasing' | 'decreasing' | 'stable'
  }
}
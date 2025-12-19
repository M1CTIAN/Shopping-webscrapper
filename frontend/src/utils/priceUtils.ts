/**
 * Utility functions for price manipulation and formatting
 */

/**
 * Extract numeric value from price string
 * @param priceString - Price string like "₹3,849" or "3,849."
 * @returns Numeric value
 */
export function extractNumericPrice(priceString: string): number {
  if (!priceString) return 0
  
  // Remove all non-numeric characters except decimal points and hyphens
  const cleaned = priceString.replace(/[^\d.-]/g, '').replace(/,/g, '')
  const numeric = parseFloat(cleaned)
  
  return isNaN(numeric) ? 0 : numeric
}

/**
 * Format price for display
 * @param price - Numeric price
 * @param currency - Currency symbol (default: ₹)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = '₹'): string {
  return `${currency}${price.toLocaleString('en-IN')}`
}

/**
 * Format a raw price string for display
 * Removes trailing dots and ensures currency symbol is present
 * @param priceString - Raw price string from backend
 * @returns Formatted price string
 */
export function formatDisplayPrice(priceString: string): string {
  if (!priceString) return '₹0'
  
  // Extract the numeric value to normalize formatting
  const numeric = extractNumericPrice(priceString)
  return formatPrice(numeric)
}

/**
 * Calculate price change percentage
 * @param oldPrice - Previous price
 * @param newPrice - Current price
 * @returns Percentage change (positive for increase, negative for decrease)
 */
export function calculatePriceChange(oldPrice: number, newPrice: number): number {
  if (oldPrice === 0) return 0
  return ((newPrice - oldPrice) / oldPrice) * 100
}

/**
 * Get price trend indicator
 * @param priceHistory - Array of price history entries
 * @returns Trend direction and strength
 */
export function getPriceTrend(priceHistory: { price: string; timestamp: string }[]) {
  if (priceHistory.length < 2) {
    return { direction: 'stable', strength: 0, description: 'Insufficient data' }
  }

  const prices = priceHistory.map(entry => extractNumericPrice(entry.price))
  const validPrices = prices.filter(p => p > 0)
  
  if (validPrices.length < 2) {
    return { direction: 'stable', strength: 0, description: 'Insufficient valid data' }
  }

  // Calculate trend using linear regression slope
  const n = validPrices.length
  const xValues = Array.from({ length: n }, (_, i) => i)
  const yValues = validPrices

  const sumX = xValues.reduce((a, b) => a + b, 0)
  const sumY = yValues.reduce((a, b) => a + b, 0)
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Normalize slope to percentage
  const avgPrice = sumY / n
  const trendStrength = (slope / avgPrice) * 100

  let direction: 'increasing' | 'decreasing' | 'stable'
  let description: string

  if (Math.abs(trendStrength) < 0.5) {
    direction = 'stable'
    description = 'Price remains relatively stable'
  } else if (trendStrength > 0) {
    direction = 'increasing'
    description = `Price trending upward (${trendStrength.toFixed(1)}%)`
  } else {
    direction = 'decreasing'
    description = `Price trending downward (${Math.abs(trendStrength).toFixed(1)}%)`
  }

  return {
    direction,
    strength: Math.abs(trendStrength),
    description,
    slope,
    intercept
  }
}

/**
 * Get the best price from history
 * @param priceHistory - Array of price history entries
 * @returns Object with lowest and highest prices with timestamps
 */
export function getBestPrices(priceHistory: { price: string; timestamp: string }[]) {
  if (!priceHistory.length) {
    return { lowest: null, highest: null }
  }

  let lowestPrice = Infinity
  let highestPrice = -Infinity
  let lowestEntry = null
  let highestEntry = null

  for (const entry of priceHistory) {
    const numericPrice = extractNumericPrice(entry.price)
    if (numericPrice > 0) {
      if (numericPrice < lowestPrice) {
        lowestPrice = numericPrice
        lowestEntry = entry
      }
      if (numericPrice > highestPrice) {
        highestPrice = numericPrice
        highestEntry = entry
      }
    }
  }

  return {
    lowest: lowestEntry ? {
      price: lowestPrice,
      originalPrice: lowestEntry.price,
      timestamp: lowestEntry.timestamp,
      date: new Date(lowestEntry.timestamp).toLocaleDateString()
    } : null,
    highest: highestEntry ? {
      price: highestPrice,
      originalPrice: highestEntry.price,
      timestamp: highestEntry.timestamp,
      date: new Date(highestEntry.timestamp).toLocaleDateString()
    } : null
  }
}
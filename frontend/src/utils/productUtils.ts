import { Product } from '../types/product'

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getProductName = (product: Product) => {
  // Use scraped product name if available, otherwise fallback to URL extraction
  if (product.product_name && product.product_name !== 'Product') {
    return product.product_name
  }
  
  // Fallback to URL extraction
  try {
    const urlParts = product.clean_url.split('/')
    let productPart = urlParts.find(part => 
      part.includes('-') && part.length > 10 && !part.includes('dp') && !part.includes('ref')
    )
    
    if (!productPart) {
      const dpIndex = urlParts.findIndex(part => part === 'dp')
      if (dpIndex > 0) {
        productPart = urlParts[dpIndex - 1]
      }
    }
    
    if (productPart) {
      return productPart
        .split('-')
        .slice(0, 6)
        .join(' ')
        .replace(/%20/g, ' ')
        .replace(/[^\w\s]/g, ' ')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }
    return 'Product'
  } catch {
    return 'Product'
  }
}

export const getWebsiteName = (url: string) => {
  const domain = url.toLowerCase()
  if (domain.includes('amazon')) return 'Amazon'
  if (domain.includes('myntra')) return 'Myntra'
  return 'Store'
}

export const getWebsiteColor = (url: string) => {
  const domain = url.toLowerCase()
  if (domain.includes('amazon')) return 'bg-orange-100 text-orange-800'
  if (domain.includes('myntra')) return 'bg-purple-100 text-purple-800'
  return 'bg-gray-100 text-gray-800'
}

export const getProductImage = (product: Product) => {
  // Use scraped image if available
  if (product.image_url) {
    return product.image_url
  }
  
  // Fallback to placeholder with dynamic color
  const colors = ['3B82F6', '10B981', 'F59E0B', 'EF4444', '8B5CF6', '06B6D4']
  const colorIndex = product.product_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return `https://via.placeholder.com/300x200/${colors[colorIndex]}/ffffff?text=Product+Image`
}
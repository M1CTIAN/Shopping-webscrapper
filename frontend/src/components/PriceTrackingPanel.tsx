'use client'

import React, { useState, useEffect } from 'react'

interface TrackingStatus {
  tracking_statistics: {
    total_products: number
    total_price_checks: number
    total_price_changes: number
    recent_updates_24h: number
    change_rate: string
    average_checks_per_product: string
  }
  status: string
  last_updated: string
}

interface StaleProduct {
  product_id: string
  product_name: string
  last_updated: string
  hours_since_update: number | string
}

export default function PriceTrackingPanel() {
  const [status, setStatus] = useState<TrackingStatus | null>(null)
  const [staleProducts, setStaleProducts] = useState<StaleProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchTrackingStatus()
    fetchStaleProducts()
  }, [])

  const fetchTrackingStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/track/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch tracking status:', error)
    }
  }

  const fetchStaleProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/track/stale/24')
      const data = await response.json()
      setStaleProducts(data.stale_products || [])
    } catch (error) {
      console.error('Failed to fetch stale products:', error)
    }
  }

  const updateSingleProduct = async (productId: string) => {
    setUpdating(productId)
    try {
      const response = await fetch(`http://localhost:8000/track/update/${productId}`, {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        setMessage(`✅ Updated ${productId}: ${data.old_price} → ${data.new_price}`)
        fetchTrackingStatus()
        fetchStaleProducts()
      } else {
        setMessage(`❌ Failed to update ${productId}: ${data.message}`)
      }
    } catch {
      setMessage(`❌ Error updating ${productId}`)
    } finally {
      setUpdating(null)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const updateAllProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/track/update-all', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        setMessage(`✅ ${data.message}`)
      } else {
        setMessage(`❌ Failed to start batch update`)
      }
    } catch {
      setMessage(`❌ Error starting batch update`)
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const updateStaleProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/track/update-stale/24', {
        method: 'POST'
      })
      const data = await response.json()
      
      setMessage(`✅ Updated ${data.updated_count} stale products, ${data.failed_count} failed`)
      fetchTrackingStatus()
      fetchStaleProducts()
    } catch {
      setMessage(`❌ Error updating stale products`)
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Price Tracking Control Panel</h2>
        <button 
          onClick={fetchTrackingStatus}
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' :
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Current Status */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{status.tracking_statistics.total_products}</div>
            <div className="text-sm text-blue-700">Total Products</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{status.tracking_statistics.total_price_checks}</div>
            <div className="text-sm text-green-700">Total Checks</div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">{status.tracking_statistics.total_price_changes}</div>
            <div className="text-sm text-yellow-700">Price Changes</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{status.tracking_statistics.change_rate}</div>
            <div className="text-sm text-purple-700">Change Rate</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={updateAllProducts}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </span>
          ) : (
            'Update All Products'
          )}
        </button>
        
        <button
          onClick={updateStaleProducts}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
        >
          Update Stale Products ({staleProducts.length})
        </button>
        
        <button
          onClick={() => {fetchTrackingStatus(); fetchStaleProducts()}}
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          Refresh Status
        </button>
      </div>

      {/* Stale Products */}
      {staleProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Products Needing Updates ({staleProducts.length})
          </h3>
          <div className="space-y-3">
            {staleProducts.slice(0, 10).map((product) => (
              <div key={product.product_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">
                    {product.product_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    ID: {product.product_id}
                  </div>
                  <div className="text-xs text-gray-500">
                    Last updated: {typeof product.hours_since_update === 'number' 
                      ? `${product.hours_since_update.toFixed(1)} hours ago`
                      : product.hours_since_update}
                  </div>
                </div>
                
                <button
                  onClick={() => updateSingleProduct(product.product_id)}
                  disabled={updating === product.product_id}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {updating === product.product_id ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating
                    </span>
                  ) : (
                    'Update Now'
                  )}
                </button>
              </div>
            ))}
            
            {staleProducts.length > 10 && (
              <div className="text-center py-4 text-gray-500">
                ... and {staleProducts.length - 10} more products
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Stale Products */}
      {staleProducts.length === 0 && (
        <div className="text-center py-8 text-green-600">
          <svg className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold">All Products Up to Date!</h3>
          <p className="text-sm">No products need immediate price updates.</p>
        </div>
      )}
    </div>
  )
}
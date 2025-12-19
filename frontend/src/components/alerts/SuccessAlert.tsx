interface SuccessAlertProps {
  result: {
    status: string
    product_name?: string
    current_price: string
    message: string
    image_url?: string
  }
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

export default function SuccessAlert({ result, onImageError }: SuccessAlertProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
      <div className="flex items-center">
        <svg className="h-6 w-6 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-green-800">
          {result.status === 'new_product' ? 'New Product Added!' : 'Product Updated!'}
        </h3>
      </div>
      <div className="mt-4 space-y-2">
        {result.product_name && (
          <p className="text-sm text-green-700">
            <strong>Product:</strong> {result.product_name}
          </p>
        )}
        <p className="text-sm text-green-700">
          <strong>Current Price:</strong> {result.current_price}
        </p>
        <p className="text-sm text-green-700">
          <strong>Status:</strong> {result.message}
        </p>
        {result.image_url && (
          <div className="mt-3">
            <img 
              src={result.image_url} 
              alt={result.product_name || 'Product'} 
              className="w-24 h-24 object-cover rounded-lg"
              onError={onImageError}
            />
          </div>
        )}
      </div>
    </div>
  )
}
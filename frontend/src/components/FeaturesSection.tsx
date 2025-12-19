export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      bgColor: 'bg-blue-100',
      title: 'Auto-Monitoring',
      description: 'We continuously monitor prices across multiple platforms.'
    },
    {
      icon: (
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 6V8a1 1 0 00-1-1H5a1 1 0 00-1 1v2m0 0v8a1 1 0 001 1h14a1 1 0 001-1v-8M9 12h6" />
        </svg>
      ),
      bgColor: 'bg-green-100',
      title: 'Price History',
      description: 'Track price changes over time with detailed history.'
    },
    {
      icon: (
        <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-yellow-100',
      title: 'Smart Tracking',
      description: 'Intelligent price monitoring with historical data.'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
      {features.map((feature, index) => (
        <div key={index} className="text-center">
          <div className={`${feature.bgColor} rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
            {feature.icon}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
          <p className="text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  )
}
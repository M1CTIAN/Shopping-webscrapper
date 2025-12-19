export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      bgColor: 'bg-blue-500/10',
      title: 'Auto-Monitoring',
      description: 'We continuously monitor prices across multiple platforms so you don\'t have to.'
    },
    {
      icon: (
        <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      bgColor: 'bg-emerald-500/10',
      title: 'Price History',
      description: 'Visualize price trends over time with detailed interactive charts.'
    },
    {
      icon: (
        <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bgColor: 'bg-amber-500/10',
      title: 'Instant Alerts',
      description: 'Get notified immediately when prices drop below your target.'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
      {features.map((feature, index) => (
        <div key={index} className="group p-8 rounded-3xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1">
          <div className={`${feature.bgColor} rounded-2xl p-4 w-16 h-16 mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            {feature.icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
          <p className="text-slate-400 leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
  )
}
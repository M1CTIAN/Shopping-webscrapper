export default function HeroSection() {
  return (
    <div className="text-center mb-16 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 mb-6 tracking-tight">
        Track Prices.<br />
        <span className="text-blue-500">Save Money.</span>
      </h1>
      <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
        Never miss a price drop again. Monitor your favorite products from Amazon, Flipkart, and more with real-time alerts and history charts.
      </p>
    </div>
  )
}
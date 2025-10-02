# Shopping Web Scraper 🛒

A modern web application that tracks product prices from popular e-commerce websites like Amazon and Flipkart. Get notified when prices drop and never miss a deal again!

## ✨ Features

- **Price Tracking**: Monitor product prices from Amazon, Flipkart, and other e-commerce sites
- **Price History**: Track price changes over time with detailed history
- **Product Information**: Automatically extracts product names and images
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **Real-time Updates**: Automatic price monitoring and updates

## 🚀 Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **BeautifulSoup4** - Web scraping and HTML parsing
- **Pydantic** - Data validation and serialization
- **JSON Storage** - Simple file-based data persistence

### Frontend
- **Next.js** - React framework with TypeScript
- **Tailwind CSS** - Utility-first CSS framework
- **Responsive Design** - Works on all devices

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🎯 Usage

1. **Start the Backend**: Run the FastAPI server on `http://localhost:8000`
2. **Start the Frontend**: Run the Next.js app on `http://localhost:3000`
3. **Add Products**: Paste product URLs from Amazon or Flipkart
4. **Track Prices**: Monitor price changes and view history
5. **Get Updates**: Check your dashboard for price drops

## 🌐 Supported Websites

- ✅ **Amazon** - Full support with images and product names
- ✅ **Flipkart** - Full support with images and product names
- ❌ **Myntra** - Currently not supported (too many anti-bot measures)

### Homepage
Clean interface for adding new products to track

### Product Cards
Beautiful cards showing product information, current prices, and price change indicators

### Dashboard
Comprehensive view of all tracked products with price history

## 🛠️ Project Structure

```
Shopping-webscrapper/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models/              # Data models
│   ├── services/            # Business logic
│   ├── config/              # Configuration
│   └── price_data.json      # Data storage
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables
- `API_URL` - Backend API URL (default: http://localhost:8000)
- `PORT` - Frontend port (default: 3000)

### Scraping Settings
- Request timeout: 10 seconds
- Max retries: 3
- User-Agent rotation for better scraping success

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is for educational purposes. Please respect the terms of service of the websites you scrape.

## ⚠️ Disclaimer

This tool is for personal use only. Please be respectful of website resources and follow their robots.txt and terms of service.

---

**Made with ❤️ by [M1CTIAN](https://github.com/M1CTIAN)**
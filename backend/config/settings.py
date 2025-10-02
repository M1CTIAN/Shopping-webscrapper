"""
Configuration settings for the Price Tracker API
"""

# API Configuration
API_TITLE = "Price Tracker API"
API_DESCRIPTION = "Track product prices from various e-commerce websites"
API_VERSION = "1.0.0"

# Data Storage
DATA_FILE = "price_data.json"

# Web Scraping Configuration
SCRAPING_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
}

# Scraping Settings
REQUEST_TIMEOUT = 10
MAX_RETRIES = 3

# Amazon specific selectors
AMAZON_PRICE_SELECTORS = [
    '.a-price-whole',
    '.a-price .a-offscreen',
    '#priceblock_dealprice',
    '#priceblock_ourprice',
    '.a-price-range'
]

# Price regex patterns
PRICE_PATTERNS = [
    r'₹[\d,]+\.?\d*',
    r'\$[\d,]+\.?\d*',
    r'[\d,]+\.?\d*\s*₹'
]
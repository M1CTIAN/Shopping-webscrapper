"""
Configuration package for Price Tracker API
Contains application settings and configuration
"""

# Import all settings
from .settings import (
    API_TITLE,
    API_DESCRIPTION,
    API_VERSION,
    DATA_FILE,
    SCRAPING_HEADERS,
    REQUEST_TIMEOUT,
    MAX_RETRIES,
    AMAZON_PRICE_SELECTORS,
    PRICE_PATTERNS
)

# Define what gets imported when someone does "from config import *"
__all__ = [
    "API_TITLE",
    "API_DESCRIPTION", 
    "API_VERSION",
    "DATA_FILE",
    "SCRAPING_HEADERS",
    "REQUEST_TIMEOUT",
    "MAX_RETRIES",
    "AMAZON_PRICE_SELECTORS",
    "PRICE_PATTERNS"
]
"""
Services package for Price Tracker API
Contains business logic and data processing services
"""

# Import main services
from .scraper import scraper, PriceScraper
from .database import DatabaseService
from .url_processor import extract_product_id, get_clean_url, detect_website

# Define what gets imported when someone does "from services import *"
__all__ = [
    "scraper",
    "PriceScraper",
    "DatabaseService",
    "extract_product_id",
    "get_clean_url",
    "detect_website"
]
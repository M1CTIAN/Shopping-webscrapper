"""
Utility helper functions
"""
from datetime import datetime
import re
from typing import Optional

def validate_url(url: str) -> bool:
    """Validate if URL is properly formatted"""
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return url_pattern.match(url) is not None

def format_price(price: str) -> str:
    """Format price string for consistency"""
    if not price or price in ["Price not found", "Error"]:
        return price
    
    # Remove extra whitespace
    price = price.strip()
    
    # Add currency symbol if missing
    if any(char.isdigit() for char in price) and not any(symbol in price for symbol in ['₹', '$', '€']):
        price = f"₹{price}"
    
    return price

def get_current_timestamp() -> str:
    """Get current timestamp in ISO format"""
    return datetime.now().isoformat()

def extract_numeric_price(price: str) -> Optional[float]:
    """Extract numeric value from price string"""
    try:
        # Remove currency symbols and commas
        numeric_str = re.sub(r'[₹$€,]', '', price)
        return float(numeric_str)
    except (ValueError, AttributeError):
        return None
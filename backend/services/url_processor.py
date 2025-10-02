"""
URL processing and product ID extraction functions
"""
import re
from urllib.parse import urlparse
from typing import Optional

def extract_product_id(url: str) -> str:
    """Extract clean product ID from URL"""
    try:
        clean_url = url.lower().rstrip('/')
        
        # Amazon ASIN extraction
        if 'amazon' in clean_url:
            asin_match = re.search(r'(?:/dp/|/gp/product/)([A-Z0-9]{10})', url, re.IGNORECASE)
            if asin_match:
                return f"amazon_{asin_match.group(1)}"
        
        # Flipkart product ID extraction
        elif 'flipkart' in clean_url:
            flipkart_match = re.search(r'/p/(itm[A-Z0-9]+)', url, re.IGNORECASE)
            if flipkart_match:
                return f"flipkart_{flipkart_match.group(1)}"
        
        # Myntra product ID
        elif 'myntra' in clean_url:
            myntra_match = re.search(r'/(\d+)/buy', url)
            if myntra_match:
                return f"myntra_{myntra_match.group(1)}"
        
        # Generic fallback
        parsed = urlparse(url)
        domain = parsed.netloc.replace('www.', '')
        path = parsed.path.strip('/')
        return f"{domain}_{abs(hash(path)) % 1000000}"
        
    except Exception:
        return f"generic_{abs(hash(url)) % 1000000}"

def get_clean_url(url: str) -> str:
    """Get clean URL without tracking parameters"""
    try:
        parsed = urlparse(url)
        
        # Amazon: Keep only essential parts
        if 'amazon' in parsed.netloc.lower():
            asin_match = re.search(r'(?:/dp/|/gp/product/)([A-Z0-9]{10})', url, re.IGNORECASE)
            if asin_match:
                return f"https://{parsed.netloc}/dp/{asin_match.group(1)}"
        
        # For other sites, remove query parameters
        return f"{parsed.scheme}://{parsed.netloc}{parsed.path}".rstrip('/')
        
    except Exception:
        return url

def detect_website(url: str) -> str:
    """Detect which e-commerce website the URL belongs to"""
    url_lower = url.lower()
    
    if 'amazon' in url_lower:
        return 'amazon'
    elif 'flipkart' in url_lower:
        return 'flipkart'
    elif 'myntra' in url_lower:
        return 'myntra'
    else:
        return 'unknown'
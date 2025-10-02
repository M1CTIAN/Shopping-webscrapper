"""
Web scraping functionality for different e-commerce sites
"""
import requests
from bs4 import BeautifulSoup
import re
from typing import Optional, Dict, Any
from config.settings import SCRAPING_HEADERS, REQUEST_TIMEOUT, AMAZON_PRICE_SELECTORS, PRICE_PATTERNS

class PriceScraper:
    """Main price scraper class"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(SCRAPING_HEADERS)
    
    def scrape_product_data(self, url: str) -> Dict[str, Any]:
        """Main product scraping function - returns price, name, and image"""
        try:
            response = self.session.get(url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Initialize result
            result = {
                'price': 'Price not found',
                'name': 'Product',
                'image_url': None
            }
            
            # Try site-specific scraping first
            if 'amazon' in url.lower():
                result.update(self._scrape_amazon_data(soup))
            elif 'flipkart' in url.lower():
                result.update(self._scrape_flipkart_data(soup))
            elif 'myntra' in url.lower():
                result.update(self._scrape_myntra_data(soup))
            else:
                result.update(self._scrape_generic_data(soup))
            
            # Fallback price extraction if not found
            if result['price'] == 'Price not found':
                page_text = soup.get_text()
                price = self._scrape_price_with_regex(page_text)
                if price:
                    result['price'] = price
            
            return result
            
        except requests.RequestException as e:
            return {
                'price': f"Request error: {str(e)}",
                'name': 'Product',
                'image_url': None
            }
        except Exception as e:
            return {
                'price': f"Scraping error: {str(e)}",
                'name': 'Product', 
                'image_url': None
            }
    
    def scrape_price(self, url: str) -> str:
        """Legacy method for backward compatibility"""
        result = self.scrape_product_data(url)
        return result['price']
    
    def _scrape_amazon_data(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract price, name, and image from Amazon page"""
        result = {
            'price': 'Price not found',
            'name': 'Product',
            'image_url': None
        }
        
        # Price extraction
        for selector in AMAZON_PRICE_SELECTORS:
            price_elem = soup.select_one(selector)
            if price_elem:
                result['price'] = price_elem.get_text(strip=True)
                break
        
        # Name extraction
        name_selectors = [
            '#productTitle',
            '.product-title',
            'h1.a-size-large',
            'h1[data-automation-id="product-title"]',
            '.a-size-large.product-title-word-break'
        ]
        
        for selector in name_selectors:
            name_elem = soup.select_one(selector)
            if name_elem:
                result['name'] = name_elem.get_text(strip=True)[:100]  # Limit length
                break
        
        # Image extraction
        image_selectors = [
            '#landingImage',
            '.a-dynamic-image',
            '#imgBlkFront',
            '.a-button-thumbnail img',
            'img[data-old-hires]'
        ]
        
        for selector in image_selectors:
            img_elem = soup.select_one(selector)
            if img_elem:
                img_src = img_elem.get('src') or img_elem.get('data-old-hires') or img_elem.get('data-src')
                if img_src and 'http' in img_src:
                    result['image_url'] = img_src
                    break
        
        return result
    
    def _scrape_flipkart_data(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract price, name, and image from Flipkart page"""
        result = {
            'price': 'Price not found',
            'name': 'Product',
            'image_url': None
        }
        
        # Price extraction
        flipkart_price_selectors = [
            '._30jeq3._16Jk6d',
            '._1_WHN1',
            '._3I9_wc._2p6lqe',
            '._25b18c'
        ]
        
        for selector in flipkart_price_selectors:
            price_elem = soup.select_one(selector)
            if price_elem:
                result['price'] = price_elem.get_text(strip=True)
                break
        
        # Name extraction
        name_selectors = [
            '.B_NuCI',
            '._35KyD6',
            '.x2Jym8._35HD7C',
            'h1._6EBuvT'
        ]
        
        for selector in name_selectors:
            name_elem = soup.select_one(selector)
            if name_elem:
                result['name'] = name_elem.get_text(strip=True)[:100]
                break
        
        # Image extraction
        image_selectors = [
            '._396cs4._2amPTt._3qGmMb img',
            '._2r_T1I img',
            '.CXW8mj img',
            '._396cs4 img'
        ]
        
        for selector in image_selectors:
            img_elem = soup.select_one(selector)
            if img_elem:
                img_src = img_elem.get('src') or img_elem.get('data-src')
                if img_src and 'http' in img_src:
                    result['image_url'] = img_src
                    break
        
        return result
    
    def _scrape_myntra_data(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract price, name, and image from Myntra page"""
        result = {
            'price': 'Price not found',
            'name': 'Product',
            'image_url': None
        }
        
        # Price extraction
        myntra_price_selectors = [
            '.pdp-price strong',
            '.pdp-price',
            '.product-discountedPrice',
            '.product-price .product-discountedPrice',
            '.pdp-price-info .pdp-price strong'
        ]
        
        for selector in myntra_price_selectors:
            price_elem = soup.select_one(selector)
            if price_elem:
                result['price'] = price_elem.get_text(strip=True)
                break
        
        # Name extraction
        name_selectors = [
            '.pdp-product-name',
            '.pdp-name',
            'h1.pdp-title',
            '.pdp-name h1',
            '.product-brand-name + .product-product'
        ]
        
        for selector in name_selectors:
            name_elem = soup.select_one(selector)
            if name_elem:
                result['name'] = name_elem.get_text(strip=True)[:100]
                break
        
        # Enhanced image extraction for Myntra
        image_selectors = [
            # Main product image
            '.image-grid-image img',
            '.product-sliderContainer img',
            '.product-imageSlider img',
            # New Myntra selectors
            '.image-grid-imageContainer img',
            '.thumbnails-container img',
            '.product-images img',
            '.pdp-image img',
            # Generic Myntra image selectors
            'img[alt*="product"]',
            'img[src*="assets.myntassets.com"]',
            '.carousel-inner img',
            # Lazy loading images
            'img[data-src*="assets.myntassets.com"]',
            'img[data-original*="assets.myntassets.com"]'
        ]
        
        for selector in image_selectors:
            img_elem = soup.select_one(selector)
            if img_elem:
                # Try multiple src attributes for lazy loading
                img_src = (
                    img_elem.get('src') or 
                    img_elem.get('data-src') or 
                    img_elem.get('data-original') or
                    img_elem.get('data-lazy-src')
                )
                
                if img_src:
                    # Ensure it's a full URL
                    if img_src.startswith('//'):
                        img_src = 'https:' + img_src
                    elif img_src.startswith('/'):
                        img_src = 'https://assets.myntassets.com' + img_src
                    
                    # Check if it's a valid Myntra image URL
                    if ('http' in img_src and 
                        ('myntassets.com' in img_src or 'myntra.com' in img_src) and
                        not any(skip in img_src.lower() for skip in ['placeholder', 'loading', 'spinner'])):
                        result['image_url'] = img_src
                        break
        
        # If no image found, try to find any high-quality image on the page
        if not result['image_url']:
            all_images = soup.find_all('img')
            for img in all_images:
                img_src = img.get('src') or img.get('data-src')
                if (img_src and 
                    'myntassets.com' in img_src and 
                    any(size in img_src for size in ['1080', '1440', '2160', 'large']) and
                    not any(skip in img_src.lower() for skip in ['placeholder', 'loading', 'thumbnail'])):
                    if img_src.startswith('//'):
                        img_src = 'https:' + img_src
                    result['image_url'] = img_src
                    break
        
        return result
    
    def _scrape_generic_data(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Generic scraping for unknown sites"""
        result = {
            'price': 'Price not found',
            'name': 'Product',
            'image_url': None
        }
        
        # Generic name extraction
        name_selectors = [
            'h1',
            '.product-title',
            '.product-name',
            '[class*="title"]',
            '[class*="name"]'
        ]
        
        for selector in name_selectors:
            name_elem = soup.select_one(selector)
            if name_elem and len(name_elem.get_text(strip=True)) > 5:
                result['name'] = name_elem.get_text(strip=True)[:100]
                break
        
        # Generic image extraction
        image_selectors = [
            '.product-image img',
            '.main-image img',
            '[class*="product"] img',
            'img[alt*="product"]'
        ]
        
        for selector in image_selectors:
            img_elem = soup.select_one(selector)
            if img_elem:
                img_src = img_elem.get('src') or img_elem.get('data-src')
                if img_src and 'http' in img_src and 'placeholder' not in img_src.lower():
                    result['image_url'] = img_src
                    break
        
        return result
    
    def _scrape_price_with_regex(self, text: str) -> Optional[str]:
        """Extract price using regex patterns"""
        for pattern in PRICE_PATTERNS:
            matches = re.findall(pattern, text)
            if matches:
                return matches[0]
        return None

# Global scraper instance
scraper = PriceScraper()
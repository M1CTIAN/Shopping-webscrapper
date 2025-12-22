"""
Web scraping functionality for different e-commerce sites
"""
import requests
from bs4 import BeautifulSoup
import re
import json
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
            
            # Clean the price format
            result['price'] = self._clean_price(result['price'])
            
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
                # 1. Try data-old-hires (often high res)
                if img_elem.get('data-old-hires'):
                    result['image_url'] = img_elem.get('data-old-hires')
                    break
                
                # 2. Try data-a-dynamic-image (JSON with multiple sizes)
                if img_elem.get('data-a-dynamic-image'):
                    try:
                        images = json.loads(img_elem.get('data-a-dynamic-image'))
                        if images:
                            # Sort by width (index 0 of value list)
                            sorted_images = sorted(images.items(), key=lambda x: x[1][0], reverse=True)
                            result['image_url'] = sorted_images[0][0]
                            break
                    except:
                        pass

                # 3. Fallback to src and try to clean it
                img_src = img_elem.get('src') or img_elem.get('data-src')
                if img_src and 'http' in img_src:
                    # Remove resolution modifiers like ._SY300_SX300_ to get full size
                    # Pattern: ._XY123_.jpg or ._XY123_XY123_.jpg
                    clean_src = re.sub(r'\._[A-Z]{2}\d+(?:_[A-Z]{2}\d+)?_?\.jpg$', '.jpg', img_src)
                    result['image_url'] = clean_src
                    break
        
        return result
    
    def _scrape_myntra_data(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract price, name, and image from Myntra page"""
        result = {
            'price': 'Price not found',
            'name': 'Product',
            'image_url': None
        }

        # 1. Try extracting from JSON data in script tags (Most reliable for Myntra)
        try:
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string and 'pdpData' in script.string:
                    # Look for window.__myx = { ... } or similar structure
                    # We'll try to extract the JSON object containing pdpData
                    
                    # Regex to find the JSON object starting with {"pdpData":
                    # This is a bit loose but often works for embedded JSON
                    # Updated regex to be greedy and handle missing semicolon
                    json_match = re.search(r'window\.__myx\s*=\s*({.*})', script.string)
                    if json_match:
                        data_str = json_match.group(1)
                        if data_str.endswith(';'):
                            data_str = data_str[:-1]
                        
                        data = json.loads(data_str)
                        
                        if 'pdpData' in data:
                            pdp_data = data['pdpData']
                            
                            # Name
                            if 'name' in pdp_data:
                                result['name'] = pdp_data['name']
                            
                            # Price
                            if 'price' in pdp_data:
                                price_info = pdp_data['price']
                                if isinstance(price_info, dict):
                                    result['price'] = str(price_info.get('discounted', price_info.get('mrp', '')))
                                else:
                                    result['price'] = str(price_info)
                            elif 'mrp' in pdp_data:
                                result['price'] = str(pdp_data['mrp'])
                            
                            # Image
                            if 'media' in pdp_data and 'albums' in pdp_data['media']:
                                albums = pdp_data['media']['albums']
                                if albums and len(albums) > 0:
                                    images = albums[0].get('images', [])
                                    if images and len(images) > 0:
                                        # Prefer imageURL which is clean, fallback to src
                                        result['image_url'] = images[0].get('imageURL') or images[0].get('src')
                                        # If we found everything, return immediately
                                        if result['image_url'] and result['name'] != 'Product':
                                            return result
        except Exception as e:
            print(f"Error extracting Myntra JSON: {e}")

        # 2. Fallback to HTML scraping
        
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
        
        # 3. Check for background-image in div (common in Myntra)
        if not result['image_url']:
            # Try specific classes first, then all divs with style attribute
            divs_to_check = soup.select('.image-grid-image') + soup.select('.image-grid-imageContainer div')
            
            # If specific classes fail, check ALL divs with style attribute (aggressive fallback)
            if not divs_to_check:
                divs_to_check = soup.find_all('div', style=True)

            for div_elem in divs_to_check:
                style = div_elem.get('style', '')
                if 'background-image' in style and 'myntassets.com' in style:
                    # Extract URL from background-image: url("...")
                    match = re.search(r'url\([\'"]?(https?://[^)]+)[\'"]?\)', style)
                    if match:
                        img_url = match.group(1)
                        # Verify it's a product image (usually has h_, w_, q_ params or similar)
                        if 'assets.myntassets.com' in img_url:
                             result['image_url'] = img_url
                             break

        # If no image found, try to find any high-quality image on the page
        if not result['image_url']:
            all_images = soup.find_all('img')
            for img in all_images:
                img_src = img.get('src') or img.get('data-src')
                if (img_src and 
                    'myntassets.com' in img_src and 
                    # Relaxed size check to include 720p and other common sizes
                    any(size in img_src for size in ['720', '1080', '1440', '2160', 'large', 'h_']) and
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
    
    def _clean_price(self, price: str) -> str:
        """Clean price string to remove currency symbols and format consistently"""
        if not price or price in ['Price not found', 'Request error', 'Scraping error']:
            return price
        # Remove currency symbols and keep only digits, dots, and commas
        cleaned = re.sub(r'[^\d.,]', '', price)
        # Remove commas and extra dots, keep only the last dot for decimals
        parts = cleaned.replace(',', '').split('.')
        if len(parts) > 1:
            # Reconstruct with only one dot
            cleaned = ''.join(parts[:-1]) + '.' + parts[-1]
        else:
            cleaned = ''.join(parts)
        # Remove trailing dots
        cleaned = cleaned.rstrip('.')
        return cleaned if cleaned else 'Price not found'

    def close(self):
        """Close the session"""
        if hasattr(self, 'session'):
            self.session.close()

# Global scraper instance
scraper = PriceScraper()
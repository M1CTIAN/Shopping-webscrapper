from services.scraper import PriceScraper
import json

def test_flipkart_scraping():
    url = "https://www.flipkart.com/xiaomi15-black-512-gb/p/itm00146e5363403"
    
    scraper = PriceScraper()
    print(f"Scraping URL: {url}")
    
    result = scraper.scrape_product_data(url)
    
    print("\nScraping Result:")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_flipkart_scraping()

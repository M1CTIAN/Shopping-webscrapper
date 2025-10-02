"""
Background price tracking scheduler using APScheduler
Automatically checks prices at defined intervals
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
import asyncio
import logging
from typing import List, Dict, Any
import json

from services.database import DatabaseService
from services.scraper import scraper
from services.url_processor import get_clean_url

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('price_tracking.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class PriceTrackingScheduler:
    """Automated price tracking scheduler"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.db = DatabaseService()
        self.is_running = False
        
    async def start_scheduler(self):
        """Start the price tracking scheduler"""
        if self.is_running:
            logger.warning("Scheduler is already running")
            return
            
        logger.info("🚀 Starting Price Tracking Scheduler")
        
        # Schedule different tracking frequencies
        # High priority products: every 2 hours
        self.scheduler.add_job(
            func=self.track_high_priority_products,
            trigger=IntervalTrigger(hours=2),
            id='high_priority_tracking',
            name='High Priority Products - Every 2 hours',
            replace_existing=True
        )
        
        # Regular products: every 6 hours
        self.scheduler.add_job(
            func=self.track_regular_products,
            trigger=IntervalTrigger(hours=6),
            id='regular_tracking',
            name='Regular Products - Every 6 hours',
            replace_existing=True
        )
        
        # Daily summary and cleanup
        self.scheduler.add_job(
            func=self.daily_maintenance,
            trigger=CronTrigger(hour=2, minute=0),  # 2:00 AM daily
            id='daily_maintenance',
            name='Daily Maintenance',
            replace_existing=True
        )
        
        # Weekly deep scan (all products)
        self.scheduler.add_job(
            func=self.weekly_full_scan,
            trigger=CronTrigger(day_of_week=0, hour=3, minute=0),  # Sunday 3:00 AM
            id='weekly_scan',
            name='Weekly Full Scan',
            replace_existing=True
        )
        
        self.scheduler.start()
        self.is_running = True
        logger.info("✅ Price Tracking Scheduler started successfully")
    
    async def stop_scheduler(self):
        """Stop the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("🛑 Price Tracking Scheduler stopped")
    
    async def track_high_priority_products(self):
        """Track high-priority products (frequent price changes or user favorites)"""
        logger.info("🔥 Starting high-priority product tracking...")
        
        data = self.db.load_data()
        high_priority_products = []
        
        # Identify high priority products
        for product in data.get("products", []):
            # Products with recent price changes or high volatility
            price_changes = product.get("price_changes", 0)
            total_checks = product.get("total_price_checks", 1)
            
            # Mark as high priority if:
            # 1. High change frequency (>20% of checks resulted in price changes)
            # 2. Recently added (less than 7 days old)
            # 3. Manually marked as favorite (we can add this later)
            change_rate = price_changes / total_checks
            
            added_date = datetime.fromisoformat(product.get("added_at", ""))
            days_old = (datetime.now() - added_date).days
            
            if change_rate > 0.2 or days_old < 7:
                high_priority_products.append(product)
        
        await self._track_products_batch(high_priority_products, "High Priority")
    
    async def track_regular_products(self):
        """Track regular products"""
        logger.info("📊 Starting regular product tracking...")
        
        data = self.db.load_data()
        regular_products = []
        
        for product in data.get("products", []):
            price_changes = product.get("price_changes", 0)
            total_checks = product.get("total_price_checks", 1)
            change_rate = price_changes / total_checks
            
            added_date = datetime.fromisoformat(product.get("added_at", ""))
            days_old = (datetime.now() - added_date).days
            
            # Regular products (not high priority)
            if change_rate <= 0.2 and days_old >= 7:
                regular_products.append(product)
        
        await self._track_products_batch(regular_products, "Regular")
    
    async def weekly_full_scan(self):
        """Comprehensive weekly scan of all products"""
        logger.info("🔍 Starting weekly full scan...")
        
        data = self.db.load_data()
        all_products = data.get("products", [])
        
        await self._track_products_batch(all_products, "Weekly Full Scan")
        
        # Generate weekly report
        await self._generate_weekly_report(all_products)
    
    async def daily_maintenance(self):
        """Daily maintenance tasks"""
        logger.info("🧹 Starting daily maintenance...")
        
        # Clean up old log files
        # Backup data
        # Generate daily summary
        data = self.db.load_data()
        products = data.get("products", [])
        
        summary = {
            "date": datetime.now().isoformat(),
            "total_products": len(products),
            "total_price_checks": sum(p.get("total_price_checks", 0) for p in products),
            "total_price_changes": sum(p.get("price_changes", 0) for p in products),
            "active_products": len([p for p in products if self._is_recently_updated(p)])
        }
        
        logger.info(f"📈 Daily Summary: {json.dumps(summary, indent=2)}")
    
    async def _track_products_batch(self, products: List[Dict], batch_name: str):
        """Track a batch of products with error handling and rate limiting"""
        if not products:
            logger.info(f"No products to track for {batch_name}")
            return
        
        logger.info(f"📦 Tracking {len(products)} products for {batch_name}")
        
        successful_updates = 0
        failed_updates = 0
        
        for i, product in enumerate(products):
            try:
                # Rate limiting: wait between requests to be respectful
                if i > 0:
                    await asyncio.sleep(2)  # 2 second delay between requests
                
                success = await self._update_single_product_price(product)
                if success:
                    successful_updates += 1
                else:
                    failed_updates += 1
                    
            except Exception as e:
                logger.error(f"❌ Error tracking product {product.get('product_id', 'unknown')}: {str(e)}")
                failed_updates += 1
        
        logger.info(f"✅ {batch_name} completed: {successful_updates} successful, {failed_updates} failed")
    
    async def _update_single_product_price(self, product: Dict) -> bool:
        """Update price for a single product"""
        try:
            product_id = product.get("product_id")
            original_url = product.get("original_url")
            
            if not original_url:
                logger.warning(f"No URL found for product {product_id}")
                return False
            
            # Scrape current price
            product_data = scraper.scrape_product_data(original_url)
            new_price = product_data.get('price', 'Price not found')
            
            if new_price == 'Price not found':
                logger.warning(f"Could not fetch price for {product_id}")
                return False
            
            # Load fresh data (in case it was updated by another process)
            data = self.db.load_data()
            
            # Find and update the product
            for i, stored_product in enumerate(data["products"]):
                if stored_product.get("product_id") == product_id:
                    old_price = stored_product.get("current_price", "")
                    
                    # Update product with new price
                    update_result = self.db.update_existing_product(
                        stored_product, 
                        new_price, 
                        product_data.get('name'), 
                        product_data.get('image_url')
                    )
                    
                    # Save updated data
                    self.db.save_data(data)
                    
                    # Log price change if it occurred
                    if update_result["status"] == "price_changed":
                        logger.info(f"💰 Price change detected for {product_id}: {old_price} → {new_price}")
                    else:
                        logger.debug(f"📊 Price check completed for {product_id}: {new_price} (no change)")
                    
                    return True
            
            logger.warning(f"Product {product_id} not found in database")
            return False
            
        except Exception as e:
            logger.error(f"Error updating product {product.get('product_id', 'unknown')}: {str(e)}")
            return False
    
    def _is_recently_updated(self, product: Dict) -> bool:
        """Check if product was updated recently (within last 24 hours)"""
        try:
            last_updated = datetime.fromisoformat(product.get("last_updated", ""))
            return (datetime.now() - last_updated) < timedelta(days=1)
        except:
            return False
    
    async def _generate_weekly_report(self, products: List[Dict]):
        """Generate comprehensive weekly report"""
        report = {
            "report_date": datetime.now().isoformat(),
            "total_products": len(products),
            "products_with_changes": len([p for p in products if p.get("price_changes", 0) > 0]),
            "top_volatile_products": [],
            "best_deals_found": [],
            "summary_stats": {}
        }
        
        # Calculate volatility and find best deals
        volatile_products = []
        for product in products:
            price_history = product.get("price_history", [])
            if len(price_history) >= 2:
                prices = []
                for entry in price_history:
                    try:
                        # Extract numeric price
                        numeric_price = float(''.join(filter(str.isdigit, entry.get("price", "").replace('.', '').replace(',', ''))))
                        prices.append(numeric_price)
                    except:
                        continue
                
                if prices:
                    min_price = min(prices)
                    max_price = max(prices)
                    volatility = (max_price - min_price) / min_price * 100 if min_price > 0 else 0
                    
                    volatile_products.append({
                        "product_id": product.get("product_id"),
                        "product_name": product.get("product_name", "Unknown"),
                        "volatility": volatility,
                        "min_price": min_price,
                        "max_price": max_price,
                        "current_price": prices[-1] if prices else 0
                    })
        
        # Sort by volatility and take top 5
        volatile_products.sort(key=lambda x: x["volatility"], reverse=True)
        report["top_volatile_products"] = volatile_products[:5]
        
        logger.info(f"📑 Weekly Report Generated: {json.dumps(report, indent=2, default=str)}")
        
        # Save report to file
        with open(f"weekly_report_{datetime.now().strftime('%Y%m%d')}.json", "w") as f:
            json.dump(report, f, indent=2, default=str)

# Global scheduler instance
price_scheduler = PriceTrackingScheduler()

async def start_background_tracking():
    """Start background price tracking"""
    await price_scheduler.start_scheduler()

async def stop_background_tracking():
    """Stop background price tracking"""
    await price_scheduler.stop_scheduler()
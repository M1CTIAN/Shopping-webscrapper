"""
Manual and on-demand price tracking endpoints
Provides immediate price updates and batch operations
"""
from fastapi import HTTPException, BackgroundTasks
from datetime import datetime, timedelta
import logging
from typing import List, Dict, Any

from services.database import DatabaseService
from services.scraper import scraper
from models.schemas import ProductResponse

logger = logging.getLogger(__name__)

class ManualPriceTracker:
    """Handle manual and on-demand price tracking"""
    
    def __init__(self):
        self.db = DatabaseService()
    
    def update_single_product_now(self, product_id: str) -> Dict[str, Any]:
        """Immediately update price for a single product"""
        try:
            data = self.db.load_data()
            
            # Find product
            product = None
            for p in data["products"]:
                if p.get("product_id") == product_id:
                    product = p
                    break
            
            if not product:
                raise HTTPException(status_code=404, detail="Product not found")
            
            # Scrape current price
            original_url = product.get("original_url")
            product_data = scraper.scrape_product_data(original_url)
            new_price = product_data.get('price', 'Price not found')
            
            if new_price == 'Price not found':
                return {
                    "success": False,
                    "message": "Could not fetch current price",
                    "product_id": product_id
                }
            
            # Update product
            old_price = product.get("current_price")
            update_result = self.db.update_existing_product(
                product, 
                new_price, 
                product_data.get('name'), 
                product_data.get('image_url')
            )
            
            # Save data
            self.db.save_data(data)
            
            return {
                "success": True,
                "message": update_result["message"],
                "product_id": product_id,
                "old_price": old_price,
                "new_price": new_price,
                "change_type": update_result.get("change_type", "unknown"),
                "status": update_result["status"]
            }
            
        except Exception as e:
            logger.error(f"Error updating product {product_id}: {str(e)}")
            return {
                "success": False,
                "message": f"Error updating product: {str(e)}",
                "product_id": product_id
            }
    
    def update_all_products_batch(self, background_tasks: BackgroundTasks) -> Dict[str, Any]:
        """Queue batch update of all products in background"""
        data = self.db.load_data()
        products = data.get("products", [])
        
        if not products:
            return {
                "success": False,
                "message": "No products found to update"
            }
        
        # Queue background task
        background_tasks.add_task(self._batch_update_worker, products)
        
        return {
            "success": True,
            "message": f"Queued batch update for {len(products)} products",
            "total_products": len(products),
            "estimated_completion": "5-10 minutes"  # Rough estimate
        }
    
    def _batch_update_worker(self, products: List[Dict]):
        """Background worker for batch updates"""
        logger.info(f"🔄 Starting batch update for {len(products)} products")
        
        successful = 0
        failed = 0
        
        for i, product in enumerate(products):
            try:
                product_id = product.get("product_id")
                result = self.update_single_product_now(product_id)
                
                if result["success"]:
                    successful += 1
                    if result.get("status") == "price_changed":
                        logger.info(f"💰 Price change: {product_id} - {result.get('old_price')} → {result.get('new_price')}")
                else:
                    failed += 1
                    logger.warning(f"❌ Failed to update {product_id}: {result.get('message')}")
                
                # Rate limiting
                import time
                time.sleep(1)  # 1 second between requests
                
            except Exception as e:
                logger.error(f"❌ Error in batch update for product {product.get('product_id', 'unknown')}: {str(e)}")
                failed += 1
        
        logger.info(f"✅ Batch update completed: {successful} successful, {failed} failed")
    
    def get_stale_products(self, hours: int = 24) -> List[Dict]:
        """Get products that haven't been updated recently"""
        data = self.db.load_data()
        products = data.get("products", [])
        stale_products = []
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        for product in products:
            try:
                last_updated = datetime.fromisoformat(product.get("last_updated", ""))
                if last_updated < cutoff_time:
                    stale_products.append({
                        "product_id": product.get("product_id"),
                        "product_name": product.get("product_name", "Unknown"),
                        "last_updated": product.get("last_updated"),
                        "hours_since_update": (datetime.now() - last_updated).total_seconds() / 3600
                    })
            except:
                # If we can't parse the date, consider it stale
                stale_products.append({
                    "product_id": product.get("product_id"),
                    "product_name": product.get("product_name", "Unknown"),
                    "last_updated": product.get("last_updated", "Unknown"),
                    "hours_since_update": "Unknown"
                })
        
        return stale_products
    
    def update_stale_products(self, hours: int = 24) -> Dict[str, Any]:
        """Update only products that are stale (haven't been updated recently)"""
        stale_products = self.get_stale_products(hours)
        
        if not stale_products:
            return {
                "success": True,
                "message": "All products are up to date",
                "updated_count": 0
            }
        
        successful = 0
        failed = 0
        
        for stale_product in stale_products:
            try:
                result = self.update_single_product_now(stale_product["product_id"])
                if result["success"]:
                    successful += 1
                else:
                    failed += 1
            except:
                failed += 1
        
        return {
            "success": True,
            "message": f"Updated {successful} stale products, {failed} failed",
            "updated_count": successful,
            "failed_count": failed,
            "total_stale": len(stale_products)
        }

# Global instance
manual_tracker = ManualPriceTracker()
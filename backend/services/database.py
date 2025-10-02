"""
Database operations for storing and retrieving product data
"""

import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
from fastapi import HTTPException
from config.settings import DATA_FILE


class DatabaseService:
    """Handle all database operations"""

    @staticmethod
    def load_data() -> Dict[str, List[Any]]:
        """Load existing data from JSON file"""
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                pass
        return {"products": [], "price_history": []}

    @staticmethod
    def save_data(data: Dict[str, List[Any]]) -> None:
        """Save data to JSON file"""
        try:
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to save data: {str(e)}"
            )

    @staticmethod
    def find_existing_product(
        data: Dict[str, List[Any]], product_id: str
    ) -> Optional[Dict[str, Any]]:
        """Find existing product by product_id"""
        for product in data["products"]:
            if product.get("product_id") == product_id:
                return product
        return None

    @staticmethod
    def create_product_entry(
        product_id: str, url: str, clean_url: str, current_price: str, 
        product_name: str = None, image_url: str = None
    ) -> Dict[str, Any]:
        """Create new product entry with price history array (includes name and image)"""
        timestamp = datetime.now().isoformat()
        return {
            "product_id": product_id,
            "original_url": url,
            "clean_url": clean_url,
            "added_at": timestamp,
            "last_updated": timestamp,
            "current_price": current_price,
            "product_name": product_name,
            "image_url": image_url,
            "price_history": [  # Initialize with first price
                {
                    "price": current_price,
                    "timestamp": timestamp,
                    "change_type": "initial"
                }
            ],
            "total_price_checks": 1,
            "price_changes": 0
        }

    @staticmethod
    def update_existing_product(
        product: Dict[str, Any], new_price: str, 
        product_name: str = None, image_url: str = None
    ) -> Dict[str, str]:
        """Update existing product with new price check and potentially new name/image"""
        timestamp = datetime.now().isoformat()
        old_price = product["current_price"]
        
        # Update basic info
        product["last_updated"] = timestamp
        product["total_price_checks"] = product.get("total_price_checks", 0) + 1
        
        # Update name and image if provided and not already set
        if product_name and not product.get("product_name"):
            product["product_name"] = product_name
        if image_url and not product.get("image_url"):
            product["image_url"] = image_url
        
        # Check if price actually changed
        if old_price != new_price:
            product["current_price"] = new_price
            product["price_changes"] = product.get("price_changes", 0) + 1
            
            # Determine change type
            change_type = "unknown"
            try:
                old_numeric = float(''.join(filter(str.isdigit, old_price.replace('.', '').replace(',', ''))))
                new_numeric = float(''.join(filter(str.isdigit, new_price.replace('.', '').replace(',', ''))))
                
                if new_numeric < old_numeric:
                    change_type = "decrease"
                elif new_numeric > old_numeric:
                    change_type = "increase"
                else:
                    change_type = "same"
            except (ValueError, AttributeError):
                change_type = "unknown"
            
            # Add to price history
            product["price_history"].append({
                "price": new_price,
                "timestamp": timestamp,
                "change_type": change_type,
                "previous_price": old_price
            })
            
            return {
                "status": "price_changed",
                "message": f"Price changed from {old_price} to {new_price}",
                "change_type": change_type
            }
        else:
            # Price is the same, just add a check record (optional)
            return {
                "status": "no_change",
                "message": f"Price remains the same: {new_price}",
                "change_type": "same"
            }

    @staticmethod
    def create_price_history_entry(product_id: str, price: str) -> Dict[str, Any]:
        """Create price history entry (for backward compatibility)"""
        return {
            "product_id": product_id,
            "price": price,
            "timestamp": datetime.now().isoformat()
        }

    @staticmethod
    def get_price_history(product_id: str) -> List[Dict[str, Any]]:
        """Get price history for a specific product"""
        data = DatabaseService.load_data()
        
        # First, try to get from product's price_history array
        for product in data["products"]:
            if product.get("product_id") == product_id:
                return product.get("price_history", [])
        
        # Fallback to old price_history format
        return [entry for entry in data["price_history"] if entry["product_id"] == product_id]
    
    @staticmethod
    def get_product_stats(product_id: str) -> Dict[str, Any]:
        """Get detailed stats for a product"""
        data = DatabaseService.load_data()
        
        for product in data["products"]:
            if product.get("product_id") == product_id:
                price_history = product.get("price_history", [])
                
                stats = {
                    "product_id": product_id,
                    "total_checks": product.get("total_price_checks", 0),
                    "price_changes": product.get("price_changes", 0),
                    "current_price": product.get("current_price"),
                    "first_price": price_history[0]["price"] if price_history else None,
                    "lowest_price": None,
                    "highest_price": None,
                    "price_trend": "stable"
                }
                
                if price_history:
                    # Extract numeric prices for comparison
                    numeric_prices = []
                    for entry in price_history:
                        try:
                            numeric = float(''.join(filter(str.isdigit, entry["price"].replace('.', '').replace(',', ''))))
                            numeric_prices.append(numeric)
                        except (ValueError, AttributeError):
                            continue
                    
                    if numeric_prices:
                        stats["lowest_price"] = min(numeric_prices)
                        stats["highest_price"] = max(numeric_prices)
                        
                        # Determine trend
                        if len(numeric_prices) >= 2:
                            recent_avg = sum(numeric_prices[-3:]) / len(numeric_prices[-3:])
                            older_avg = sum(numeric_prices[:3]) / len(numeric_prices[:3])
                            
                            if recent_avg < older_avg * 0.95:
                                stats["price_trend"] = "decreasing"
                            elif recent_avg > older_avg * 1.05:
                                stats["price_trend"] = "increasing"
                
                return stats
        
        return None
    
    @staticmethod
    def delete_product(product_id: str) -> bool:
        """Delete a product and its price history"""
        data = DatabaseService.load_data()
        
        # Check if product exists
        product_exists = any(p.get("product_id") == product_id for p in data["products"])
        
        if not product_exists:
            return False
        
        # Remove product and price history
        data["products"] = [p for p in data["products"] if p.get("product_id") != product_id]
        data["price_history"] = [h for h in data["price_history"] if h.get("product_id") != product_id]
        
        DatabaseService.save_data(data)
        return True

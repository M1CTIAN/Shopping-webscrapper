"""
Main FastAPI application for Price Tracker API
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

# Import models
from models.schemas import (
    ProductURL, ProductResponse, ProductsResponse, 
    PriceHistoryResponse, HealthResponse, DeleteResponse
)

# Import services
from services.scraper import scraper
from services.database import DatabaseService
from services.url_processor import extract_product_id, get_clean_url

# Import configuration
from config.settings import API_TITLE, API_DESCRIPTION, API_VERSION

# ===============================
# FASTAPI APP CONFIGURATION
# ===============================
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION
)

# Add CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database service
db = DatabaseService()

# ===============================
# API ENDPOINTS
# ===============================
@app.get("/", tags=["General"])
def read_root():
    """Welcome endpoint"""
    return {"message": f"Welcome to {API_TITLE}", "version": API_VERSION}

@app.get("/health", response_model=HealthResponse, tags=["General"])
def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy", 
        timestamp=datetime.now().isoformat()
    )

@app.post("/track-product", response_model=ProductResponse, tags=["Products"])
def add_product_tracking(product: ProductURL):
    """Add a product for price tracking with enhanced data extraction"""
    # Extract product information
    product_id = extract_product_id(str(product.url))
    clean_url = get_clean_url(str(product.url))
    
    # Scrape product data (price, name, image)
    product_data = scraper.scrape_product_data(str(product.url))
    current_price = product_data.get('price', 'Price not found')
    product_name = product_data.get('name', 'Product')
    image_url = product_data.get('image_url')
    
    # Load existing data
    data = db.load_data()
    
    # Check for existing product
    existing_product = db.find_existing_product(data, product_id)
    
    if existing_product:
        # UPDATE EXISTING PRODUCT
        update_result = db.update_existing_product(
            existing_product, current_price, product_name, image_url
        )
        message = update_result["message"]
        status_detail = update_result["status"]
        
    else:
        # CREATE NEW PRODUCT
        product_entry = db.create_product_entry(
            product_id, str(product.url), clean_url, current_price, product_name, image_url
        )
        data["products"].append(product_entry)
        message = "New product added for tracking"
        status_detail = "new_product"
    
    # Save data
    db.save_data(data)
    
    return ProductResponse(
        message=message,
        product_id=product_id,
        clean_url=clean_url,
        current_price=current_price,
        product_name=product_name,
        image_url=image_url,
        status=status_detail
    )

@app.get("/products", response_model=ProductsResponse, tags=["Products"])
def get_all_products():
    """Get all tracked products"""
    data = db.load_data()
    
    # Add extra info to each product
    enhanced_products = []
    for product in data["products"]:
        enhanced_product = product.copy()
        enhanced_product["price_history_count"] = len(product.get("price_history", []))
        enhanced_product["total_checks"] = product.get("total_price_checks", 0)
        enhanced_product["price_changes"] = product.get("price_changes", 0)
        enhanced_products.append(enhanced_product)
    
    return ProductsResponse(
        products=enhanced_products,
        total_count=len(enhanced_products)
    )

@app.get("/price-history/{product_id}", response_model=PriceHistoryResponse, tags=["Products"])
def get_price_history(product_id: str):
    """Get price history for a specific product"""
    history = db.get_price_history(product_id)
    
    if not history:
        raise HTTPException(status_code=404, detail="No price history found for this product")
    
    return PriceHistoryResponse(
        product_id=product_id,
        price_history=history,
        total_records=len(history)
    )

@app.get("/product-stats/{product_id}", tags=["Products"])
def get_product_stats(product_id: str):
    """Get detailed statistics for a product"""
    stats = db.get_product_stats(product_id)
    
    if not stats:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return stats

@app.delete("/products/{product_id}", response_model=DeleteResponse, tags=["Products"])
def delete_product(product_id: str):
    """Delete a tracked product and its price history"""
    success = db.delete_product(product_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return DeleteResponse(message=f"Product {product_id} deleted successfully")

# ===============================
# STARTUP EVENT
# ===============================
@app.on_event("startup")
async def startup_event():
    print("🚀 Price Tracker API is starting up!")
    print(f"📊 Visit http://127.0.0.1:8000/docs for interactive documentation")

@app.on_event("shutdown")
async def shutdown_event():
    scraper.close()
    print("🛑 Price Tracker API is shutting down!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
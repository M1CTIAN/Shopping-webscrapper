"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProductURL(BaseModel):
    url: str  # Only URL required now

class ProductResponse(BaseModel):
    message: str
    product_id: str
    clean_url: str
    current_price: str
    product_name: Optional[str] = None
    image_url: Optional[str] = None
    status: str

class Product(BaseModel):
    product_id: str
    original_url: str
    clean_url: str
    added_at: str
    last_updated: str
    current_price: str
    product_name: Optional[str] = None
    image_url: Optional[str] = None

class PriceHistory(BaseModel):
    product_id: str
    price: str
    timestamp: str

class ProductsResponse(BaseModel):
    products: List[Product]
    total_count: int

class PriceHistoryResponse(BaseModel):
    product_id: str
    price_history: List[PriceHistory]
    total_records: int

class HealthResponse(BaseModel):
    status: str
    timestamp: str

class DeleteResponse(BaseModel):
    message: str
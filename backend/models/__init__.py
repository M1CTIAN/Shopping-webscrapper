"""
Models package for Price Tracker API
Contains Pydantic models for request/response validation
"""

# Import all schemas to make them easily accessible
from .schemas import (
    ProductURL,
    ProductResponse,
    Product,
    PriceHistory,
    ProductsResponse,
    PriceHistoryResponse,
    HealthResponse,
    DeleteResponse
)

# Define what gets imported when someone does "from models import *"
__all__ = [
    "ProductURL",
    "ProductResponse", 
    "Product",
    "PriceHistory",
    "ProductsResponse",
    "PriceHistoryResponse",
    "HealthResponse",
    "DeleteResponse"
]
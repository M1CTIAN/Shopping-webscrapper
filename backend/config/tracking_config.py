"""
Price tracking configuration
Customize tracking intervals, notification settings, etc.
"""

# Tracking Intervals (in hours)
TRACKING_INTERVALS = {
    "high_priority": 2,      # Every 2 hours for volatile products
    "regular": 6,            # Every 6 hours for stable products  
    "weekly_scan": 24 * 7,   # Weekly comprehensive scan
    "stale_threshold": 24    # Consider product stale after 24 hours
}

# Rate Limiting (seconds between requests)
RATE_LIMITING = {
    "between_requests": 2,    # 2 seconds between individual requests
    "batch_delay": 1,        # 1 second between batch requests
    "retry_delay": 5,        # 5 seconds before retrying failed requests
    "max_retries": 3         # Maximum number of retries
}

# Notification Settings
NOTIFICATIONS = {
    "enable_webhooks": True,
    "enable_email": False,  # Set to True and configure email settings
    "enable_console_logs": True,
    "notify_on_decrease": True,    # Always notify on price drops
    "notify_on_increase": False,   # Don't notify on price increases by default
    "minimum_change_percent": 1.0  # Only notify if change is > 1%
}

# Website-specific settings
WEBSITE_SETTINGS = {
    "amazon": {
        "priority": "high",
        "check_frequency": 2,  # hours
        "respect_robots_txt": True
    },
    "flipkart": {
        "priority": "high", 
        "check_frequency": 3,  # hours
        "respect_robots_txt": True
    },
    "myntra": {
        "priority": "medium",
        "check_frequency": 6,  # hours
        "respect_robots_txt": True
    },
    "generic": {
        "priority": "low",
        "check_frequency": 12,  # hours
        "respect_robots_txt": True
    }
}

# Logging Configuration
LOGGING = {
    "log_level": "INFO",
    "log_file": "price_tracking.log",
    "max_log_size": "10MB",
    "backup_count": 5,
    "log_format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
}

# Data Management
DATA_MANAGEMENT = {
    "backup_interval_hours": 24,  # Backup data every 24 hours
    "max_price_history_entries": 1000,  # Keep max 1000 price points per product
    "cleanup_old_entries": True,  # Auto-cleanup old entries
    "compress_old_data": True     # Compress old data to save space
}

# Performance Settings  
PERFORMANCE = {
    "max_concurrent_requests": 5,  # Max simultaneous scraping requests
    "request_timeout": 30,         # Timeout for each request (seconds)
    "connection_pool_size": 10,    # HTTP connection pool size
    "enable_caching": True,        # Cache responses to reduce requests
    "cache_duration": 300          # Cache duration in seconds
}
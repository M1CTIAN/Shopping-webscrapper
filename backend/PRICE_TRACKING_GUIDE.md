# 🎯 **Price Tracking Implementation Guide**

## **Overview**
I've implemented a comprehensive automated price tracking system with multiple approaches to suit different needs. Here's how to set up and use each method:

---

## 🚀 **1. Quick Setup**

### **Install Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

### **Start the API Server**
```bash
python main.py
# or
uvicorn main:app --reload --port 8000
```

---

## 📋 **2. Available Tracking Methods**

### **A. Manual/On-Demand Tracking**
Perfect for immediate price updates and testing.

**API Endpoints:**
- `POST /track/update/{product_id}` - Update single product now
- `POST /track/update-all` - Update all products (background task)
- `GET /track/stale/24` - Get products not updated in 24 hours
- `POST /track/update-stale/24` - Update only stale products
- `GET /track/status` - Get tracking statistics

**Usage Examples:**
```bash
# Update single product immediately
curl -X POST "http://localhost:8000/track/update/amazon_B0CHX1W1XY"

# Update all products (queued in background)
curl -X POST "http://localhost:8000/track/update-all"

# Check which products are stale (not updated in 24h)
curl "http://localhost:8000/track/stale/24"

# Update only stale products
curl -X POST "http://localhost:8000/track/update-stale/24"

# Get tracking statistics
curl "http://localhost:8000/track/status"
```

### **B. Scheduled Background Tracking** *(Recommended)*
Automated tracking with intelligent scheduling.

**Features:**
- **High Priority Products**: Every 2 hours (volatile prices, new products)
- **Regular Products**: Every 6 hours (stable prices)  
- **Weekly Deep Scan**: Complete analysis every Sunday
- **Daily Maintenance**: Cleanup and reporting at 2 AM

**Setup:**
1. Install APScheduler: `pip install apscheduler`
2. Enable in your startup code:

```python
from services.price_scheduler import start_background_tracking

# Add to your FastAPI startup
@app.on_event("startup")
async def startup_event():
    await start_background_tracking()
    print("🚀 Price Tracker API with Background Scheduling started!")
```

### **C. Webhook Notifications**
Get instant alerts when prices change.

**Setup Discord Webhook:**
```python
from services.notifications import configure_discord_webhook

# Your Discord webhook URL
configure_discord_webhook("https://discord.com/api/webhooks/YOUR_WEBHOOK_URL")
```

**Setup Slack Webhook:**
```python
from services.notifications import configure_slack_webhook

configure_slack_webhook("https://hooks.slack.com/services/YOUR_WEBHOOK_URL")
```

**Setup Email Notifications:**
```python
from services.notifications import configure_email_notifications

configure_email_notifications(
    smtp_server="smtp.gmail.com",
    smtp_port=587,
    username="your-email@gmail.com",
    password="your-app-password",
    from_email="your-email@gmail.com"
)
```

---

## ⚙️ **3. Configuration Options**

### **Tracking Intervals** (in `config/tracking_config.py`)
```python
TRACKING_INTERVALS = {
    "high_priority": 2,      # Every 2 hours
    "regular": 6,            # Every 6 hours  
    "weekly_scan": 24 * 7,   # Weekly
    "stale_threshold": 24    # Consider stale after 24h
}
```

### **Rate Limiting** (be respectful to websites)
```python
RATE_LIMITING = {
    "between_requests": 2,    # 2 seconds between requests
    "max_retries": 3         # Max retry attempts
}
```

### **Notification Settings**
```python
NOTIFICATIONS = {
    "notify_on_decrease": True,    # Always alert on price drops
    "notify_on_increase": False,   # Skip price increase alerts
    "minimum_change_percent": 1.0  # Only notify if change > 1%
}
```

---

## 📊 **4. Smart Features**

### **Intelligent Priority Classification**
Products are automatically classified as:
- **High Priority**: >20% price change rate OR added in last 7 days
- **Regular Priority**: Stable products with low change rates

### **Advanced Analytics**
- **Price Volatility Detection**: Identifies unstable pricing
- **Trend Analysis**: Mathematical trend calculation using linear regression
- **Best Deal Alerts**: Highlights lowest prices found
- **Comprehensive Reports**: Daily/weekly analytics

### **Error Handling & Resilience**
- **Automatic Retries**: Failed requests are retried automatically
- **Rate Limiting**: Respects website servers with delays
- **Graceful Degradation**: Continues tracking even if some products fail
- **Detailed Logging**: All activities logged for debugging

---

## 🎮 **5. Usage Scenarios**

### **Scenario 1: Personal Use (Simple)**
```bash
# Start the API server
python main.py

# Add products via the web interface
# Check http://localhost:3001

# Manually update prices when needed
curl -X POST "http://localhost:8000/track/update-all"
```

### **Scenario 2: Automated Monitoring (Recommended)**
```python
# Enable background scheduler in main.py
from services.price_scheduler import start_background_tracking

@app.on_event("startup")
async def startup_event():
    await start_background_tracking()
    # Setup notifications
    configure_discord_webhook("YOUR_DISCORD_WEBHOOK_URL")
```

### **Scenario 3: Enterprise/High Volume**
```python
# Use with external task queue (Celery + Redis)
# Scale horizontally with multiple worker instances
# Add database support (PostgreSQL) for better performance
# Implement user accounts and product subscriptions
```

---

## 📈 **6. Monitoring & Analytics**

### **Real-time Status**
```bash
curl "http://localhost:8000/track/status"
```

**Response:**
```json
{
  "tracking_statistics": {
    "total_products": 15,
    "total_price_checks": 245,
    "total_price_changes": 12,
    "recent_updates_24h": 8,
    "change_rate": "4.9%",
    "average_checks_per_product": "16.3"
  },
  "status": "active"
}
```

### **Price History Analytics**
- View interactive charts at `/product/{id}`
- Price volatility calculations
- Trend direction analysis
- Best price tracking with timestamps
- Savings calculations from initial price

---

## 🔧 **7. Customization Options**

### **Website-Specific Settings**
```python
WEBSITE_SETTINGS = {
    "amazon": {
        "priority": "high",
        "check_frequency": 2,  # hours
    },
    "flipkart": {
        "priority": "high", 
        "check_frequency": 3,
    }
}
```

### **Performance Tuning**
```python
PERFORMANCE = {
    "max_concurrent_requests": 5,
    "request_timeout": 30,
    "connection_pool_size": 10,
    "enable_caching": True
}
```

---

## 🚨 **8. Best Practices**

### **Respectful Scraping**
✅ **2-second delays** between requests  
✅ **Proper User-Agent** headers  
✅ **Respect robots.txt** files  
✅ **Error handling** for blocked requests  
✅ **Rate limiting** to avoid overwhelming servers  

### **Data Management**
✅ **Regular backups** of price data  
✅ **Cleanup old entries** to manage storage  
✅ **Compression** for historical data  
✅ **Monitoring** for data consistency  

### **Reliability**
✅ **Automatic retry** on failures  
✅ **Graceful degradation** when sites are down  
✅ **Comprehensive logging** for troubleshooting  
✅ **Health checks** and status monitoring  

---

## 🎯 **9. Recommended Implementation**

For most users, I recommend:

1. **Start with Manual Tracking** to test functionality
2. **Enable Background Scheduler** for automation
3. **Add Discord/Slack Webhooks** for notifications  
4. **Monitor via the web interface** and API endpoints
5. **Scale up** as needed with additional features

This gives you a robust, automated price tracking system that's both powerful and respectful to the websites being monitored! 🎉
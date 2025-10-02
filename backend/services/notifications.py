"""
Notification system for price changes
Supports multiple notification channels: email, webhook, etc.
"""
import json
import requests
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
from datetime import datetime
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    """Handle various notification methods for price changes"""
    
    def __init__(self):
        self.webhook_urls = []
        self.email_settings = {
            "smtp_server": None,
            "smtp_port": 587,
            "username": None,
            "password": None,
            "from_email": None
        }
    
    def add_webhook_url(self, url: str):
        """Add a webhook URL for notifications"""
        if url not in self.webhook_urls:
            self.webhook_urls.append(url)
    
    def configure_email(self, smtp_server: str, smtp_port: int, username: str, 
                       password: str, from_email: str):
        """Configure email notifications"""
        self.email_settings.update({
            "smtp_server": smtp_server,
            "smtp_port": smtp_port,
            "username": username,
            "password": password,
            "from_email": from_email
        })
    
    async def send_price_change_notification(self, product_data: Dict[str, Any], 
                                           change_data: Dict[str, Any]):
        """Send notification when price changes"""
        
        # Prepare notification data
        notification_payload = {
            "type": "price_change",
            "timestamp": datetime.now().isoformat(),
            "product": {
                "id": product_data.get("product_id"),
                "name": product_data.get("product_name", "Unknown Product"),
                "url": product_data.get("clean_url"),
                "image_url": product_data.get("image_url")
            },
            "price_change": {
                "old_price": change_data.get("old_price"),
                "new_price": change_data.get("new_price"),
                "change_type": change_data.get("change_type"),
                "change_amount": self._calculate_change_amount(
                    change_data.get("old_price", "0"),
                    change_data.get("new_price", "0")
                ),
                "change_percentage": self._calculate_change_percentage(
                    change_data.get("old_price", "0"),
                    change_data.get("new_price", "0")
                )
            }
        }
        
        # Send to all configured channels
        await self._send_webhook_notifications(notification_payload)
        await self._send_email_notification(notification_payload)
        
        # Log notification
        logger.info(f"📧 Notification sent for {product_data.get('product_id')} price change")
    
    async def _send_webhook_notifications(self, payload: Dict[str, Any]):
        """Send webhook notifications"""
        for webhook_url in self.webhook_urls:
            try:
                response = requests.post(
                    webhook_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                if response.status_code == 200:
                    logger.info(f"✅ Webhook notification sent to {webhook_url}")
                else:
                    logger.warning(f"⚠️ Webhook notification failed to {webhook_url}: {response.status_code}")
                    
            except Exception as e:
                logger.error(f"❌ Error sending webhook to {webhook_url}: {str(e)}")
    
    async def _send_email_notification(self, payload: Dict[str, Any]):
        """Send email notification"""
        if not all([
            self.email_settings["smtp_server"],
            self.email_settings["username"],
            self.email_settings["password"],
            self.email_settings["from_email"]
        ]):
            logger.warning("📧 Email not configured, skipping email notification")
            return
        
        try:
            # Create email content
            subject = f"Price Alert: {payload['product']['name']}"
            
            # HTML email body
            html_body = self._create_email_html(payload)
            
            # Text email body (fallback)
            text_body = self._create_email_text(payload)
            
            # Create message
            msg = MimeMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.email_settings["from_email"]
            msg["To"] = "user@example.com"  # You'd get this from user preferences
            
            # Add both parts
            text_part = MimeText(text_body, "plain")
            html_part = MimeText(html_body, "html")
            msg.attach(text_part)
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.email_settings["smtp_server"], self.email_settings["smtp_port"]) as server:
                server.starttls()
                server.login(self.email_settings["username"], self.email_settings["password"])
                server.send_message(msg)
            
            logger.info("✅ Email notification sent")
            
        except Exception as e:
            logger.error(f"❌ Error sending email notification: {str(e)}")
    
    def _calculate_change_amount(self, old_price: str, new_price: str) -> Optional[float]:
        """Calculate the absolute change amount"""
        try:
            old_num = float(''.join(filter(str.isdigit, old_price.replace('.', '').replace(',', ''))))
            new_num = float(''.join(filter(str.isdigit, new_price.replace('.', '').replace(',', ''))))
            return new_num - old_num
        except:
            return None
    
    def _calculate_change_percentage(self, old_price: str, new_price: str) -> Optional[float]:
        """Calculate the percentage change"""
        try:
            old_num = float(''.join(filter(str.isdigit, old_price.replace('.', '').replace(',', ''))))
            new_num = float(''.join(filter(str.isdigit, new_price.replace('.', '').replace(',', ''))))
            
            if old_num > 0:
                return ((new_num - old_num) / old_num) * 100
            return None
        except:
            return None
    
    def _create_email_html(self, payload: Dict[str, Any]) -> str:
        """Create HTML email body"""
        product = payload["product"]
        change = payload["price_change"]
        
        change_color = "#10B981" if change["change_type"] == "decrease" else "#EF4444"
        change_icon = "📉" if change["change_type"] == "decrease" else "📈"
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9fafb; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }}
                .header {{ background-color: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ padding: 30px; }}
                .product-info {{ display: flex; align-items: center; margin-bottom: 20px; }}
                .product-image {{ width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px; }}
                .price-change {{ background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .button {{ background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{change_icon} Price Alert</h1>
                </div>
                <div class="content">
                    <div class="product-info">
                        {f'<img src="{product["image_url"]}" class="product-image" alt="Product Image">' if product.get("image_url") else ""}
                        <div>
                            <h2>{product["name"]}</h2>
                            <p>Product ID: {product["id"]}</p>
                        </div>
                    </div>
                    
                    <div class="price-change">
                        <h3 style="color: {change_color};">Price {change["change_type"].title()}</h3>
                        <p><strong>Old Price:</strong> {change["old_price"]}</p>
                        <p><strong>New Price:</strong> <span style="color: {change_color}; font-size: 1.2em; font-weight: bold;">{change["new_price"]}</span></p>
                        {f'<p><strong>Change:</strong> {change["change_percentage"]:.1f}% ({change["change_amount"]:+.0f})</p>' if change.get("change_percentage") else ""}
                    </div>
                    
                    <a href="{product["url"]}" class="button">View Product</a>
                    
                    <p style="margin-top: 30px; color: #6b7280; font-size: 0.9em;">
                        This notification was sent at {payload["timestamp"]}
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _create_email_text(self, payload: Dict[str, Any]) -> str:
        """Create plain text email body"""
        product = payload["product"]
        change = payload["price_change"]
        
        return f"""
        Price Alert for {product['name']}
        
        Product: {product['name']}
        Product ID: {product['id']}
        
        Price Change:
        Old Price: {change['old_price']}
        New Price: {change['new_price']}
        Change Type: {change['change_type'].title()}
        
        View Product: {product['url']}
        
        Notification sent at: {payload['timestamp']}
        """

# Global notification service
notification_service = NotificationService()

# Example webhook configurations (Discord, Slack, etc.)
def configure_discord_webhook(webhook_url: str):
    """Configure Discord webhook for notifications"""
    notification_service.add_webhook_url(webhook_url)

def configure_slack_webhook(webhook_url: str):
    """Configure Slack webhook for notifications"""
    notification_service.add_webhook_url(webhook_url)

def configure_email_notifications(smtp_server: str, smtp_port: int, 
                                username: str, password: str, from_email: str):
    """Configure email notifications"""
    notification_service.configure_email(smtp_server, smtp_port, username, password, from_email)
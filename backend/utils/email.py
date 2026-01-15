"""
Email utilities for sending digital keys
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def send_digital_keys_email(to_email, order_id, keys):
    """Send email with digital keys to user after purchase"""
    keys_list_html = ''
    for item in keys:
        keys_list_html += f"""
        <div style="margin: 20px 0; padding: 15px; background: #1a1a1a; border-left: 4px solid #00ff88; border-radius: 4px;">
            <h3 style="color: #00ff88; margin-top: 0;">{item['productName']}</h3>
            <p style="color: #ffffff; font-family: 'Courier New', monospace; font-size: 16px; background: #0a0a0a; padding: 10px; border-radius: 4px; word-break: break-all;">
                {item['key']}
            </p>
        </div>
        """
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; background: #0a0a0a; color: #ffffff; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; }}
            .content {{ background: #1a1a1a; padding: 30px; border-radius: 0 0 8px 8px; }}
            .warning {{ background: #ff6b6b; color: #fff; padding: 15px; border-radius: 4px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; color: #ffffff;">🎮 Your Digital Keys Are Ready!</h1>
            </div>
            <div class="content">
                <p>Thank you for your purchase! Your digital keys for Order #{order_id} are below.</p>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong> These keys are for your use only. Please save them securely. 
                    Keys are only shown once for security reasons.
                </div>

                {keys_list_html}

                <p style="margin-top: 30px; color: #888;">If you have any questions, please contact our support team.</p>
                <p style="color: #888;">Thank you for shopping with ArtG Store!</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    send_mail(
        subject=f'Your Digital Keys - Order #{order_id}',
        message='',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        html_message=html_message,
        fail_silently=False,
    )


def send_order_confirmation_email(to_email, order_id, total):
    """Send order confirmation email"""
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; background: #0a0a0a; color: #ffffff; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; }}
            .content {{ background: #1a1a1a; padding: 30px; border-radius: 0 0 8px 8px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; color: #ffffff;">✅ Order Confirmed!</h1>
            </div>
            <div class="content">
                <p>Thank you for your order!</p>
                <p><strong>Order ID:</strong> #{order_id}</p>
                <p><strong>Total:</strong> ${total:.2f}</p>
                <p>Your digital keys will be sent to this email address shortly.</p>
                <p style="margin-top: 30px; color: #888;">Thank you for shopping with IMSET E-commerce!</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    send_mail(
        subject=f'Order Confirmation - Order #{order_id}',
        message='',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        html_message=html_message,
        fail_silently=False,
    )


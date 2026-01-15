"""
Management command to seed the database with sample data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import Product
from orders.models import DigitalKey, PromoCode
from utils.encryption import encrypt_key
from datetime import datetime, timedelta
import random
import string

User = get_user_model()


def generate_key(prefix=''):
    """Generate a random digital key"""
    chars = string.ascii_uppercase + string.digits
    key = prefix
    for _ in range(20):
        key += random.choice(chars)
    return key


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('🗑️  Clearing existing data...')
        
        # Clear existing data
        DigitalKey.objects.all().delete()
        Product.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        
        # Create users
        self.stdout.write('👤 Creating users...')
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@imset.com',
            password='admin123',
            role='admin',
            is_email_verified=True,
            is_staff=True,
            is_superuser=True
        )
        
        regular_user = User.objects.create_user(
            username='john',
            email='john@example.com',
            password='user123',
            role='user',
            is_email_verified=True,
            first_name='John',
            last_name='Doe'
        )
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {User.objects.count()} users'))
        
        # Create products
        self.stdout.write('🛍️  Creating products...')
        products_data = [
            {
                'title': 'Cyberpunk 2077',
                'description': 'An open-world, action-adventure RPG set in the megalopolis of Night City',
                'price': 59.99,
                'product_type': 'GAME',
                'platform': 'PC',
                'region': 'Global',
                'category': 'RPG',
                'images': ['https://images.igdb.com/igdb/image/upload/t_cover_big/co2rpf.jpg'],
                'stock': 50,
                'featured': False
            },
            {
                'title': 'The Witcher 3: Wild Hunt',
                'description': 'A story-driven, next-generation open world RPG',
                'price': 39.99,
                'product_type': 'GAME',
                'platform': 'PC',
                'region': 'Global',
                'category': 'RPG',
                'images': ['https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg'],
                'stock': 100,
                'featured': False
            },
            {
                'title': 'Steam Gift Card $50',
                'description': 'Add $50 to your Steam wallet',
                'price': 50.00,
                'product_type': 'GIFT-CARD',
                'platform': 'Steam',
                'region': 'Global',
                'category': 'Gift Card',
                'images': ['https://cdn.cloudflare.steamstatic.com/steam/apps/1234560/header.jpg'],
                'stock': 200,
                'featured': False
            },
            {
                'title': 'PlayStation Store Gift Card $25',
                'description': 'Add $25 to your PlayStation wallet',
                'price': 25.00,
                'product_type': 'GIFT-CARD',
                'platform': 'PlayStation',
                'region': 'Global',
                'category': 'Gift Card',
                'images': ['https://www.playstation.com/en-us/ps-store/'],
                'stock': 150,
                'featured': False
            },
            {
                'title': 'Call of Duty: Modern Warfare',
                'description': 'Experience the ultimate online playground',
                'price': 69.99,
                'product_type': 'GAME',
                'platform': 'PlayStation',
                'region': 'Global',
                'category': 'Action',
                'images': ['https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.jpg'],
                'stock': 75,
                'featured': False
            },
            {
                'title': 'Xbox Game Pass Ultimate 1 Month',
                'description': 'Access to hundreds of games',
                'price': 14.99,
                'product_type': 'GIFT-CARD',
                'platform': 'Xbox',
                'region': 'Global',
                'category': 'Gift Card',
                'images': ['https://www.xbox.com/en-US/promotions/sales/xbox-game-pass'],
                'stock': 300,
                'featured': False
            },
            {
                'title': 'Elden Ring',
                'description': 'A new fantasy action RPG',
                'price': 59.99,
                'product_type': 'GAME',
                'platform': 'PC',
                'region': 'Global',
                'category': 'RPG',
                'images': ['https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.jpg'],
                'stock': 80,
                'featured': False
            },
            {
                'title': 'Apple App Store Gift Card $100',
                'description': 'Add $100 to your Apple account',
                'price': 100.00,
                'product_type': 'GIFT-CARD',
                'platform': 'Mobile',
                'region': 'Global',
                'category': 'Gift Card',
                'images': ['https://www.apple.com/shop/gift-cards'],
                'stock': 100,
                'featured': False
            }
        ]
        
        created_products = []
        for product_data in products_data:
            product = Product.objects.create(**product_data)
            created_products.append(product)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(created_products)} products'))
        
        # Create digital keys
        self.stdout.write('🔑 Creating digital keys...')
        total_keys = 0
        for product in created_products:
            key_count = product.stock
            for _ in range(key_count):
                key_value = generate_key('GAME-' if product.product_type == 'GAME' else 'GC-')
                encrypted_key = encrypt_key(key_value)
                
                DigitalKey.objects.create(
                    product=product,
                    encrypted_key=encrypted_key,
                    region=product.region,
                    is_used=False
                )
                total_keys += 1
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {total_keys} digital keys'))
        
        # Create promo codes
        self.stdout.write('🎟️  Creating promo codes...')
        
        promoCodes = [
            {
                'code': 'WELCOME10',
                'description': '10% off for new customers',
                'discount_type': 'percentage',
                'discount_value': 10,
                'min_purchase': 0,
                'valid_until': datetime.now() + timedelta(days=365),
                'usage_limit': 1000,
                'is_active': True
            },
            {
                'code': 'SAVE20',
                'description': '20% off on orders over $50',
                'discount_type': 'percentage',
                'discount_value': 20,
                'min_purchase': 50,
                'max_discount': 50,
                'valid_until': datetime.now() + timedelta(days=365),
                'usage_limit': 500,
                'is_active': True
            },
            {
                'code': 'FLAT10',
                'description': '$10 off any order',
                'discount_type': 'fixed',
                'discount_value': 10,
                'min_purchase': 25,
                'valid_until': datetime.now() + timedelta(days=180),
                'usage_limit': 200,
                'is_active': True
            }
        ]
        
        for promo_data in promoCodes:
            PromoCode.objects.create(**promo_data)
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(promoCodes)} promo codes'))
        
        self.stdout.write(self.style.SUCCESS('\n🎉 Seeding completed successfully!'))
        self.stdout.write('\n📝 Default credentials:')
        self.stdout.write('   Admin: admin@imset.com / admin123')
        self.stdout.write('   User:  john@example.com / user123')


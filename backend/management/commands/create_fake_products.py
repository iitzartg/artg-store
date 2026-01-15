"""
Management command to create fake products with TND prices
"""
from django.core.management.base import BaseCommand
from products.models import Product
from orders.models import DigitalKey
from utils.encryption import encrypt_key
import random
import string


def generate_key(prefix=''):
    """Generate a random digital key"""
    chars = string.ascii_uppercase + string.digits
    key = prefix
    for _ in range(20):
        key += random.choice(chars)
    return key


class Command(BaseCommand):
    help = 'Create fake products with TND prices'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=50,
            help='Number of products to create (default: 50)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing products before creating new ones',
        )

    def handle(self, *args, **options):
        count = options['count']
        clear = options['clear']
        
        if clear:
            self.stdout.write('🗑️  Clearing existing products...')
            Product.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✅ Cleared existing products'))
        
        # Game titles and descriptions
        games_data = [
            {
                'title': 'Assassin\'s Creed Valhalla',
                'description': 'Embark on an epic Viking adventure in this action RPG set in 9th century England.',
                'category': 'Action',
                'platform': 'PC',
                'price_range': (180, 250),
            },
            {
                'title': 'FIFA 24',
                'description': 'The latest installment in the FIFA series with improved gameplay and graphics.',
                'category': 'Sports',
                'platform': 'PlayStation',
                'price_range': (200, 280),
            },
            {
                'title': 'Call of Duty: Modern Warfare III',
                'description': 'Intense first-person shooter with multiplayer and campaign modes.',
                'category': 'Action',
                'platform': 'Xbox',
                'price_range': (220, 300),
            },
            {
                'title': 'The Legend of Zelda: Tears of the Kingdom',
                'description': 'Epic adventure game with open-world exploration and puzzle-solving.',
                'category': 'Adventure',
                'platform': 'Nintendo Switch',
                'price_range': (250, 320),
            },
            {
                'title': 'Grand Theft Auto VI',
                'description': 'Open-world crime game with immersive story and online multiplayer.',
                'category': 'Action',
                'platform': 'PC',
                'price_range': (200, 280),
            },
            {
                'title': 'Elden Ring',
                'description': 'Dark fantasy action RPG with challenging combat and vast world.',
                'category': 'RPG',
                'platform': 'PC',
                'price_range': (180, 250),
            },
            {
                'title': 'Spider-Man 2',
                'description': 'Swing through New York as Spider-Man in this action-adventure game.',
                'category': 'Action',
                'platform': 'PlayStation',
                'price_range': (220, 300),
            },
            {
                'title': 'Forza Horizon 5',
                'description': 'Racing game with stunning graphics and extensive car collection.',
                'category': 'Racing',
                'platform': 'Xbox',
                'price_range': (180, 250),
            },
            {
                'title': 'Baldur\'s Gate 3',
                'description': 'Deep RPG with turn-based combat and rich storytelling.',
                'category': 'RPG',
                'platform': 'PC',
                'price_range': (200, 280),
            },
            {
                'title': 'Mario Kart 8 Deluxe',
                'description': 'Fun racing game with Mario characters and multiplayer modes.',
                'category': 'Racing',
                'platform': 'Nintendo Switch',
                'price_range': (150, 220),
            },
            {
                'title': 'Red Dead Redemption 2',
                'description': 'Western-themed action-adventure with immersive open world.',
                'category': 'Adventure',
                'platform': 'PC',
                'price_range': (180, 250),
            },
            {
                'title': 'God of War Ragnarök',
                'description': 'Epic Norse mythology adventure with intense combat.',
                'category': 'Action',
                'platform': 'PlayStation',
                'price_range': (220, 300),
            },
            {
                'title': 'The Witcher 3: Wild Hunt',
                'description': 'Award-winning RPG with deep story and monster hunting.',
                'category': 'RPG',
                'platform': 'PC',
                'price_range': (120, 180),
            },
            {
                'title': 'Cyberpunk 2077',
                'description': 'Futuristic RPG set in Night City with cyberpunk themes.',
                'category': 'RPG',
                'platform': 'PC',
                'price_range': (150, 220),
            },
            {
                'title': 'Horizon Forbidden West',
                'description': 'Post-apocalyptic adventure with robot dinosaurs.',
                'category': 'Adventure',
                'platform': 'PlayStation',
                'price_range': (200, 280),
            },
            {
                'title': 'Starfield',
                'description': 'Space exploration RPG with vast universe to explore.',
                'category': 'RPG',
                'platform': 'PC',
                'price_range': (220, 300),
            },
            {
                'title': 'Resident Evil 4 Remake',
                'description': 'Survival horror game with intense action and suspense.',
                'category': 'Action',
                'platform': 'PlayStation',
                'price_range': (180, 250),
            },
            {
                'title': 'Diablo IV',
                'description': 'Action RPG with loot-based gameplay and dark fantasy setting.',
                'category': 'RPG',
                'platform': 'PC',
                'price_range': (200, 280),
            },
            {
                'title': 'Street Fighter 6',
                'description': 'Competitive fighting game with diverse character roster.',
                'category': 'Action',
                'platform': 'PC',
                'price_range': (150, 220),
            },
            {
                'title': 'Final Fantasy XVI',
                'description': 'Epic JRPG with cinematic storytelling and real-time combat.',
                'category': 'RPG',
                'platform': 'PlayStation',
                'price_range': (220, 300),
            },
        ]
        
        # Gift card options
        gift_cards_data = [
            {
                'title': 'Steam Gift Card',
                'description': 'Add funds to your Steam wallet for games and software.',
                'platform': 'Steam',
                'amounts': [50, 100, 150, 200, 300],
            },
            {
                'title': 'PlayStation Store Gift Card',
                'description': 'Purchase games, DLC, and subscriptions from PlayStation Store.',
                'platform': 'PlayStation',
                'amounts': [50, 100, 150, 200, 250],
            },
            {
                'title': 'Xbox Gift Card',
                'description': 'Buy games, movies, and apps from Microsoft Store.',
                'platform': 'Xbox',
                'amounts': [50, 100, 150, 200, 300],
            },
            {
                'title': 'Nintendo eShop Gift Card',
                'description': 'Add funds to your Nintendo account for games and content.',
                'platform': 'Nintendo Switch',
                'amounts': [50, 100, 150, 200],
            },
            {
                'title': 'Epic Games Store Gift Card',
                'description': 'Purchase games and in-game content from Epic Games Store.',
                'platform': 'Epic Games',
                'amounts': [50, 100, 150, 200],
            },
            {
                'title': 'Apple App Store Gift Card',
                'description': 'Buy apps, games, and subscriptions from the App Store.',
                'platform': 'Mobile',
                'amounts': [50, 100, 150, 200, 300],
            },
            {
                'title': 'Google Play Gift Card',
                'description': 'Purchase apps, games, and digital content from Google Play.',
                'platform': 'Mobile',
                'amounts': [50, 100, 150, 200],
            },
        ]
        
        self.stdout.write(f'🛍️  Creating {count} fake products with TND prices...')
        
        created_products = []
        products_created = 0
        
        # Create games
        games_to_create = min(count, len(games_data) * 3)  # Create multiple variants
        for i in range(games_to_create):
            if products_created >= count:
                break
                
            game_template = random.choice(games_data)
            price = random.randint(*game_template['price_range'])
            
            # Add some variation to titles for multiple copies
            title = game_template['title']
            if i > len(games_data):
                title = f"{game_template['title']} (Digital)"
            
            product = Product.objects.create(
                title=title,
                description=game_template['description'],
                price=price,
                product_type='GAME',
                platform=game_template['platform'],
                region='Global',
                category=game_template['category'],
                images=[],
                stock=random.randint(10, 100),
                featured=False,
                discount=random.choice([0, 0, 0, 10, 15, 20]),  # Some products have discounts
            )
            created_products.append(product)
            products_created += 1
        
        # Create gift cards
        gift_cards_to_create = count - products_created
        for i in range(gift_cards_to_create):
            if products_created >= count:
                break
                
            gift_template = random.choice(gift_cards_data)
            amount = random.choice(gift_template['amounts'])
            
            # Convert USD amount to approximate TND (1 USD ≈ 3.1 TND)
            price = round(amount * 3.1)
            
            product = Product.objects.create(
                title=f"{gift_template['title']} {amount} TND",
                description=gift_template['description'],
                price=price,
                product_type='GIFTCARD',
                platform=gift_template['platform'],
                region='Global',
                category='Gift Card',
            images=[],
            stock=random.randint(50, 200),
            featured=False,
            discount=0,
            )
            created_products.append(product)
            products_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {len(created_products)} products'))
        
        # Create digital keys for games
        self.stdout.write('🔑 Creating digital keys for games...')
        total_keys = 0
        for product in created_products:
            if product.product_type == 'GAME':
                key_count = product.stock
                for _ in range(key_count):
                    key_value = generate_key('GAME-')
                    try:
                        encrypted_key = encrypt_key(key_value)
                        DigitalKey.objects.create(
                            product=product,
                            encrypted_key=encrypted_key,
                            region=product.region,
                            is_used=False
                        )
                        total_keys += 1
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f'⚠️  Could not create key for {product.title}: {e}'))
        
        self.stdout.write(self.style.SUCCESS(f'✅ Created {total_keys} digital keys'))
        self.stdout.write(self.style.SUCCESS('\n🎉 Fake products created successfully!'))
        self.stdout.write(f'\n📊 Summary:')
        self.stdout.write(f'   - Total products: {len(created_products)}')
        self.stdout.write(f'   - Games: {len([p for p in created_products if p.product_type == "GAME"])}')
        self.stdout.write(f'   - Gift Cards: {len([p for p in created_products if p.product_type == "GIFTCARD"])}')
        self.stdout.write(f'   - All prices are in TND (Tunisian Dinar)')



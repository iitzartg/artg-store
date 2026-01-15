"""
Django management command to remove unnecessary collections from MongoDB.
This command identifies and removes collections that are not defined in the models.
"""
from django.core.management.base import BaseCommand
from django.conf import settings
import os
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Remove unnecessary collections from MongoDB database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )
        parser.add_argument(
            '--list-only',
            action='store_true',
            help='Only list collections, do not delete anything',
        )

    def get_mongodb_connection(self):
        """Get direct MongoDB connection using pymongo"""
        try:
            import pymongo
        except ImportError:
            raise ImportError("pymongo is required. Install it: pip install pymongo")
        
        # Get database settings
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = int(os.getenv('DB_PORT', '27017'))
        db_name = os.getenv('DB_NAME', 'artgstore')
        db_user = os.getenv('DB_USER', '')
        db_password = os.getenv('DB_PASSWORD', '')
        
        # Build connection string
        if db_user and db_password:
            db_auth_source = os.getenv('DB_AUTH_SOURCE', 'admin')
            mongo_uri = f"mongodb://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}?authSource={db_auth_source}"
        else:
            mongo_uri = f"mongodb://{db_host}:{db_port}/{db_name}"
        
        # Connect to MongoDB
        client = pymongo.MongoClient(mongo_uri)
        db = client[db_name]
        return db, client

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        list_only = options['list_only']
        
        # Expected collections based on models
        expected_collections = {
            # App collections (main models)
            'products',
            'reviews',
            'orders',
            'order_items',
            'digital_keys',
            'promo_codes',
            'users',
            
            # Many-to-many relationship collections
            # PromoCode.applicable_products creates this collection
            'promo_codes_applicable_products',
            
            # User model many-to-many relationships
            # These are created by Django's User model for groups and permissions
            'users_groups',  # Custom User model's groups relationship
            'users_user_permissions',  # Custom User model's permissions relationship
            'auth_user_groups',  # Standard Django auth (if used)
            'auth_user_user_permissions',  # Standard Django auth (if used)
            
            # Django system collections
            'django_migrations',  # Tracks database migrations
            'django_content_type',  # Content types for generic relations
            'django_session',  # User sessions
            'django_admin_log',  # Admin action logs (alternative name)
            'admin_logentry',  # Admin action logs (standard name)
            
            # Django auth system collections
            'auth_permission',  # Permissions
            'auth_group',  # User groups
            'auth_group_permissions',  # Group permissions
            
            # Djongo internal collections (MongoDB adapter)
            '_schema_',  # Djongo schema tracking
            '_init',  # Djongo initialization
            
            # JWT token blacklist (if used)
            'token_blacklist_outstandingtoken',
            'token_blacklist_blacklistedtoken',
        }
        
        try:
            # Get MongoDB connection
            db, client = self.get_mongodb_connection()
            
            # Get all collections
            all_collections = db.list_collection_names()
            
            # Filter out system collections (MongoDB internal)
            system_collections = {'system.indexes', 'system.users', 'system.version'}
            user_collections = [c for c in all_collections if c not in system_collections]
            
            # Find unnecessary collections
            unnecessary_collections = [c for c in user_collections if c not in expected_collections]
            
            self.stdout.write(self.style.SUCCESS('\n=== Database Collection Analysis ===\n'))
            self.stdout.write(f'Total collections found: {len(user_collections)}')
            self.stdout.write(f'Expected collections: {len(expected_collections)}')
            self.stdout.write(f'Unnecessary collections: {len(unnecessary_collections)}\n')
            
            # Add explanation
            if list_only or dry_run:
                self.stdout.write(self.style.WARNING('\n📚 Why so many collections?'))
                self.stdout.write('  • Django creates system collections for auth, sessions, migrations, etc.')
                self.stdout.write('  • Many-to-many relationships create separate collections')
                self.stdout.write('  • Djongo (MongoDB adapter) creates internal collections (_schema_, _init)')
                self.stdout.write('  • Each model gets its own collection (products, orders, users, etc.)\n')
            
            if list_only:
                self.stdout.write(self.style.WARNING('\n=== All Collections ==='))
                for coll in sorted(user_collections):
                    status = '✓ Expected' if coll in expected_collections else '✗ Unnecessary'
                    style = self.style.SUCCESS if coll in expected_collections else self.style.ERROR
                    self.stdout.write(style(f'  {status}: {coll}'))
                
                if unnecessary_collections:
                    self.stdout.write(self.style.ERROR('\n=== Unnecessary Collections (would be deleted) ==='))
                    for coll in sorted(unnecessary_collections):
                        self.stdout.write(self.style.ERROR(f'  - {coll}'))
                else:
                    self.stdout.write(self.style.SUCCESS('\n✓ No unnecessary collections found!'))
                return
            
            if unnecessary_collections:
                self.stdout.write(self.style.WARNING('\n=== Unnecessary Collections ==='))
                for coll in sorted(unnecessary_collections):
                    # Count documents in collection
                    try:
                        count = db[coll].count_documents({})
                        self.stdout.write(f'  - {coll} ({count} documents)')
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'  - {coll} (error counting: {e})'))
                
                if dry_run:
                    self.stdout.write(self.style.WARNING('\n=== DRY RUN MODE ==='))
                    self.stdout.write('The following collections would be deleted:')
                    for coll in sorted(unnecessary_collections):
                        self.stdout.write(f'  - {coll}')
                    self.stdout.write('\nRun without --dry-run to actually delete them.')
                else:
                    # Ask for confirmation
                    self.stdout.write(self.style.WARNING('\n⚠️  WARNING: This will permanently delete the collections above!'))
                    confirm = input('Type "yes" to continue: ')
                    
                    if confirm.lower() == 'yes':
                        deleted_count = 0
                        for coll in unnecessary_collections:
                            try:
                                db[coll].drop()
                                self.stdout.write(self.style.SUCCESS(f'✓ Deleted collection: {coll}'))
                                deleted_count += 1
                            except Exception as e:
                                self.stdout.write(self.style.ERROR(f'✗ Error deleting {coll}: {e}'))
                        
                        self.stdout.write(self.style.SUCCESS(f'\n✓ Successfully deleted {deleted_count} collection(s)'))
                    else:
                        self.stdout.write(self.style.WARNING('Operation cancelled.'))
            else:
                self.stdout.write(self.style.SUCCESS('\n✓ No unnecessary collections found!'))
                self.stdout.write('All collections are expected and in use.')
            
            # Close connection
            client.close()
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {e}'))
            logger.error(f'Error in cleanup_database command: {e}', exc_info=True)
            raise

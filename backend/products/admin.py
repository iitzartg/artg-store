from django.contrib import admin
from django.core.exceptions import ObjectDoesNotExist
from django.utils.html import format_html
from .models import Product, Review


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('display_id', 'title', 'product_type', 'platform', 'price', 'stock', 'is_active', 'featured')
    list_filter = ('product_type', 'platform', 'category', 'is_active', 'featured')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at', 'updated_at')
    list_display_links = ('title',)
    
    def display_id(self, obj):
        """Display the product ID, handling both standard Django IDs and MongoDB ObjectIds"""
        if obj:
            # Try to get the ID in multiple ways
            product_id = getattr(obj, 'id', None) or getattr(obj, 'pk', None) or getattr(obj, '_id', None)
            if product_id is not None:
                # Convert ObjectId to string if needed
                if hasattr(product_id, '__str__'):
                    return str(product_id)
                return product_id
        return 'N/A'
    display_id.short_description = 'ID'
    display_id.admin_order_field = 'id'
    
    def get_object(self, request, object_id, from_field=None):
        """
        Override to handle cases where object_id might be None or invalid.
        This ensures Django admin can properly retrieve product objects,
        especially when using MongoDB/djongo.
        """
        if object_id is None or object_id == 'None' or str(object_id).strip() == '':
            return None
        
        queryset = self.get_queryset(request)
        
        # Try to get the object using the primary key
        try:
            # Try converting to int first (for standard Django integer PKs)
            try:
                object_id_int = int(object_id)
                obj = queryset.get(pk=object_id_int)
                return obj
            except (ValueError, TypeError, Product.DoesNotExist):
                pass
            
            # Try as string (for MongoDB ObjectIds or string PKs)
            try:
                obj = queryset.get(pk=object_id)
                return obj
            except (Product.DoesNotExist, ValueError, TypeError):
                pass
            
            # Try using id field directly
            try:
                obj = queryset.get(id=object_id)
                return obj
            except (Product.DoesNotExist, ValueError, TypeError):
                pass
            
            # Try using _id field (MongoDB)
            try:
                obj = queryset.get(_id=object_id)
                return obj
            except (Product.DoesNotExist, ValueError, TypeError, AttributeError):
                pass
            
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Could not find product with ID: {object_id} (type: {type(object_id)})')
            return None
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Error getting product object: {e}')
            return None
    
    def get_queryset(self, request):
        """
        Override to ensure we're getting products with valid IDs
        """
        qs = super().get_queryset(request)
        # Filter out any products that might not have IDs (shouldn't happen, but just in case)
        # Note: This might not work with MongoDB, so we'll catch the exception
        try:
            return qs.exclude(id__isnull=True)
        except Exception:
            # If exclude doesn't work with MongoDB, just return the queryset as-is
            return qs


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'rating', 'is_verified', 'created_at')
    list_filter = ('rating', 'is_verified', 'created_at')
    search_fields = ('user__username', 'user__email', 'product__title', 'comment')
    readonly_fields = ('created_at', 'updated_at')


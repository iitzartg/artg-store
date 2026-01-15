from rest_framework import serializers
from .models import Product, Review
from accounts.serializers import UserSerializer


def get_product_id_from_instance(instance):
    """
    Universal function to extract product ID from a Django model instance.
    Works with both standard Django and djongo/MongoDB.
    """
    # Try the most common methods first
    # Method 1: pk attribute (works for both Django and djongo)
    try:
        if hasattr(instance, 'pk') and instance.pk is not None:
            return str(instance.pk)
    except Exception:
        pass
    
    # Method 2: id attribute
    try:
        if hasattr(instance, 'id') and instance.id is not None:
            return str(instance.id)
    except Exception:
        pass
    
    # Method 3: value_from_object (most reliable for djongo/MongoDB)
    try:
        pk = instance._meta.pk
        if hasattr(pk, 'value_from_object'):
            pk_value = pk.value_from_object(instance)
            if pk_value is not None:
                return str(pk_value)
    except Exception:
        pass
    
    # Method 4: _id attribute (MongoDB specific)
    try:
        if hasattr(instance, '_id') and instance._id is not None:
            return str(instance._id)
    except Exception:
        pass
    
    # Method 5: Primary key field name
    try:
        pk_name = instance._meta.pk.name
        pk_value = getattr(instance, pk_name, None)
        if pk_value is not None:
            return str(pk_value)
    except Exception:
        pass
    
    # Method 6: _get_pk_val (Django internal)
    try:
        if hasattr(instance, '_get_pk_val'):
            pk_val = instance._get_pk_val()
            if pk_val is not None:
                return str(pk_val)
    except Exception:
        pass
    
    # If all methods fail, return None
    return None


class ProductSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField(read_only=True)
    productType = serializers.CharField(source='product_type', required=False, allow_blank=True)
    isDigital = serializers.BooleanField(source='is_digital', read_only=True)
    isActive = serializers.BooleanField(source='is_active', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    images = serializers.JSONField(required=False, allow_null=True)
    
    class Meta:
        model = Product
        fields = ('_id', 'title', 'description', 'price', 'productType', 'platform', 
                  'region', 'category', 'images', 'isDigital', 'isActive', 'stock', 
                  'featured', 'discount', 'createdAt')
        read_only_fields = ('createdAt', '_id', 'isDigital', 'isActive')
    
    def get__id(self, obj):
        """Get product ID using the universal extraction function"""
        return get_product_id_from_instance(obj)
    
    def to_representation(self, instance):
        """Multiply price by 3.2 when returning product data and ensure _id is set"""
        representation = super().to_representation(instance)
        
        # CRITICAL: Always ensure _id is set, even if SerializerMethodField returned None
        if '_id' not in representation or representation['_id'] is None:
            _id_value = get_product_id_from_instance(instance)
            if _id_value:
                representation['_id'] = _id_value
            else:
                # Log error if we still can't get the ID
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f'Could not extract ID for product "{getattr(instance, "title", "unknown")}"')
        
        # Ensure _id is always a string
        if '_id' in representation and representation['_id'] is not None:
            representation['_id'] = str(representation['_id'])
        
        # Multiply price by 3.2
        if 'price' in representation and representation['price'] is not None:
            representation['price'] = float(representation['price']) * 3.2
        
        return representation
    
    def create(self, validated_data):
        """Handle productType to product_type mapping"""
        if 'productType' in validated_data:
            validated_data['product_type'] = validated_data.pop('productType')
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Handle productType to product_type mapping"""
        if 'productType' in validated_data:
            validated_data['product_type'] = validated_data.pop('productType')
        return super().update(instance, validated_data)


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    _id = serializers.SerializerMethodField(read_only=True)
    productType = serializers.CharField(source='product_type', read_only=True)
    isDigital = serializers.BooleanField(source='is_digital', read_only=True)
    isActive = serializers.BooleanField(source='is_active', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    
    class Meta:
        model = Product
        fields = ('_id', 'title', 'description', 'price', 'productType', 'platform', 
                  'region', 'category', 'images', 'isDigital', 'isActive', 'stock', 
                  'featured', 'discount', 'createdAt')
        read_only_fields = ('createdAt', '_id')
    
    def get__id(self, obj):
        """Get product ID using the universal extraction function"""
        return get_product_id_from_instance(obj)
    
    def to_representation(self, instance):
        """Multiply price by 3.2 when returning product data and ensure _id is set"""
        try:
            representation = super().to_representation(instance)
        except Exception as e:
            # If super() fails, create a basic representation
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Error in super().to_representation for product "{getattr(instance, "title", "unknown")}": {e}')
            representation = {
                'title': getattr(instance, 'title', 'Unknown'),
                'description': getattr(instance, 'description', ''),
                'price': float(getattr(instance, 'price', 0)) * 3.2,
            }
        
        # CRITICAL: Always ensure _id is set, even if SerializerMethodField returned None
        if '_id' not in representation or representation['_id'] is None:
            _id_value = get_product_id_from_instance(instance)
            if _id_value:
                representation['_id'] = _id_value
            else:
                # Log error but still try to get ID from instance directly
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f'Could not extract ID for product "{getattr(instance, "title", "unknown")}", trying direct access')
                
                # Last resort: try to get _id directly from instance
                try:
                    if hasattr(instance, '_id'):
                        direct_id = instance._id
                        if direct_id is not None:
                            representation['_id'] = str(direct_id)
                            logger.info(f'Successfully got _id via direct access: {direct_id}')
                except Exception as direct_error:
                    logger.error(f'Direct _id access also failed: {direct_error}')
        
        # Ensure _id is always a string if it exists
        if '_id' in representation and representation['_id'] is not None:
            representation['_id'] = str(representation['_id'])
        
        # Multiply price by 3.2
        if 'price' in representation and representation['price'] is not None:
            try:
                representation['price'] = float(representation['price']) * 3.2
            except (ValueError, TypeError):
                representation['price'] = 0.0
        
        return representation


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model"""
    _id = serializers.IntegerField(source='id', read_only=True)
    user = serializers.SerializerMethodField()
    isVerified = serializers.BooleanField(source='is_verified', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    
    class Meta:
        model = Review
        fields = ('_id', 'user', 'product', 'rating', 'comment', 'isVerified', 
                  'createdAt', 'updatedAt')
        read_only_fields = ('_id', 'user', 'isVerified', 'createdAt', 'updatedAt')
    
    def get_user(self, obj):
        """Return user information"""
        return {
            '_id': obj.user.id,
            'name': obj.user.get_full_name() or obj.user.username,
            'email': obj.user.email if self.context.get('show_email', False) else None
        }
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def validate_product(self, value):
        """Validate and convert product ID to Product instance"""
        from .models import Product
        
        # If value is already a Product instance, return it
        if isinstance(value, Product):
            return value
        
        # If value is a string or number, try to get the Product
        try:
            # Method 1: Try direct lookup
            product = Product.objects.get(pk=value)
            return product
        except (Product.DoesNotExist, ValueError, TypeError):
            pass
        
        # Method 2: Try with string conversion
        try:
            product = Product.objects.get(pk=str(value))
            return product
        except (Product.DoesNotExist, ValueError, TypeError):
            pass
        
        # Method 3: Try with ObjectId conversion (MongoDB)
        try:
            from bson import ObjectId
            if ObjectId.is_valid(str(value)):
                product = Product.objects.get(_id=ObjectId(str(value)))
                return product
        except (Product.DoesNotExist, ImportError, ValueError, TypeError):
            pass
        
        # If all methods fail, raise validation error
        raise serializers.ValidationError(f"Product with ID '{value}' not found")
    
    def create(self, validated_data):
        """Create review with current user"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ReviewListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for review lists"""
    _id = serializers.IntegerField(source='id', read_only=True)
    user = serializers.SerializerMethodField()
    isVerified = serializers.BooleanField(source='is_verified', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Review
        fields = ('_id', 'user', 'rating', 'comment', 'isVerified', 'createdAt')
    
    def get_user(self, obj):
        """Return user information"""
        return {
            '_id': obj.user.id,
            'name': obj.user.get_full_name() or obj.user.username,
        }

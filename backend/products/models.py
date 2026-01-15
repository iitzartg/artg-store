from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings

# Import ObjectIdField from djongo for MongoDB compatibility
# This project uses djongo, so ObjectIdField should be available
try:
    from djongo import models as djongo_models
except ImportError:
    # If djongo is not available, this will cause an error at runtime
    # which is expected since the project requires djongo for MongoDB
    djongo_models = None
    raise ImportError("djongo is required for this project. Please install it: pip install djongo")


class Product(models.Model):
    # Explicitly define _id as ObjectIdField for MongoDB compatibility
    # This ensures proper ObjectId handling with djongo
    # With djongo, _id maps to MongoDB's _id field and is accessible via obj.id and obj.pk
    _id = djongo_models.ObjectIdField(primary_key=True, editable=False)
    
    PRODUCT_TYPE_CHOICES = [
        ('GAME', 'Game'),
        ('GIFT-CARD', 'Gift Card'),
    ]
    
    PLATFORM_CHOICES = [
        ('PC', 'PC'),
        ('PlayStation', 'PlayStation'),
        ('Xbox', 'Xbox'),
        ('Nintendo Switch', 'Nintendo Switch'),
        ('Mobile', 'Mobile'),
        ('Steam', 'Steam'),
        ('Epic Games', 'Epic Games'),
        ('Other', 'Other'),
    ]
    
    CATEGORY_CHOICES = [
        ('Action', 'Action'),
        ('Adventure', 'Adventure'),
        ('RPG', 'RPG'),
        ('Strategy', 'Strategy'),
        ('Sports', 'Sports'),
        ('Racing', 'Racing'),
        ('Simulation', 'Simulation'),
        ('Gift Card', 'Gift Card'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPE_CHOICES)
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    region = models.CharField(max_length=50, default='Global')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    images = models.JSONField(default=list, blank=True)
    is_digital = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    stock = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    featured = models.BooleanField(default=False)
    discount = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        indexes = [
            models.Index(fields=['product_type', 'platform', 'category']),
            models.Index(fields=['is_active', 'featured']),
        ]

    def __str__(self):
        return self.title


class Review(models.Model):
    """Review model for products"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(max_length=1000, blank=True)
    is_verified = models.BooleanField(default=False)  # True if user purchased the product
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reviews'
        unique_together = [['user', 'product']]  # One review per user per product
        indexes = [
            models.Index(fields=['product', 'rating']),
            models.Index(fields=['product', '-created_at']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} - {self.product.title} - {self.rating} stars'


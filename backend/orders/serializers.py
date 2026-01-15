from rest_framework import serializers
from products.serializers import ProductSerializer
from .models import Order, OrderItem, DigitalKey, PromoCode


class DigitalKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = DigitalKey
        fields = ('id', 'encrypted_key', 'is_used', 'region')
        read_only_fields = ('id', 'encrypted_key', 'is_used', 'region')


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    digital_key = DigitalKeySerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'quantity', 'price', 'digital_key')


class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'user', 'user_email', 'order_items', 'payment_intent_id', 
                  'payment_status', 'status', 'subtotal', 'tax', 'total', 
                  'keys_delivered', 'keys_delivered_at', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = '__all__'
        read_only_fields = ('created_at', 'used_count')



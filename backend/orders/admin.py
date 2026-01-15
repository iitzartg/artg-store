from django.contrib import admin
from .models import Order, OrderItem, DigitalKey, PromoCode


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total', 'status', 'payment_status', 'created_at')
    list_filter = ('status', 'payment_status', 'created_at')
    search_fields = ('user__email', 'payment_intent_id')
    inlines = [OrderItemInline]
    readonly_fields = ('created_at', 'updated_at')


@admin.register(DigitalKey)
class DigitalKeyAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'is_used', 'region', 'created_at')
    list_filter = ('is_used', 'region', 'created_at')
    search_fields = ('product__title',)
    readonly_fields = ('created_at',)


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'discount_value', 'used_count', 'is_active', 'valid_until')
    list_filter = ('discount_type', 'is_active', 'valid_until')
    search_fields = ('code',)
    readonly_fields = ('created_at',)



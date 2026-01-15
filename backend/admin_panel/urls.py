from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.admin_stats, name='admin-stats'),
    path('products/', views.admin_products, name='admin-products'),  # GET all products, POST create
    path('products/<str:product_id>/', views.update_product, name='admin-update-product'),  # PUT/PATCH/DELETE
    path('keys/', views.add_digital_keys, name='admin-add-keys'),
    path('orders/', views.get_all_orders, name='admin-orders'),
    path('orders/<int:order_id>/status/', views.update_order_status, name='admin-update-order-status'),
    path('promo-codes/', views.create_promo_code, name='admin-create-promo'),
    path('promo-codes/list/', views.get_promo_codes, name='admin-promo-codes'),
]



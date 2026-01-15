from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'', ProductViewSet, basename='product')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
    path('featured/all/', ProductViewSet.as_view({'get': 'featured'}), name='featured-products'),
    path('platform/<str:platform>/', ProductViewSet.as_view({'get': 'by_platform'}), name='products-by-platform'),
]



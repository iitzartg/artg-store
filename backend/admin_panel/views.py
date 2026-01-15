from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count
from products.models import Product
from orders.models import Order, DigitalKey, PromoCode
from accounts.models import User
from products.serializers import ProductSerializer
from orders.serializers import OrderSerializer, PromoCodeSerializer
from utils.encryption import encrypt_key


def is_admin(user):
    """Check if user is admin"""
    return user.is_authenticated and user.role == 'admin'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    """Get admin dashboard statistics"""
    if not is_admin(request.user):
        return Response({
            'success': False,
            'message': 'Access denied. Admin privileges required.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    total_users = User.objects.count()
    total_products = Product.objects.count()
    total_orders = Order.objects.count()
    total_revenue = Order.objects.filter(payment_status='succeeded').aggregate(
        total=Sum('total')
    )['total'] or 0
    
    recent_orders = Order.objects.select_related('user').prefetch_related('order_items__product')[:10]
    
    return Response({
        'success': True,
        'data': {
            'stats': {
                'totalUsers': total_users,
                'totalProducts': total_products,
                'totalOrders': total_orders,
                'totalRevenue': float(total_revenue)
            },
            'recentOrders': OrderSerializer(recent_orders, many=True).data
        }
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_products(request):
    """Get all products (including inactive) or create new product"""
    if not is_admin(request.user):
        return Response({
            'success': False,
            'message': 'Access denied. Admin privileges required.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        # Get all products, not just active ones
        products = Product.objects.all().order_by('-created_at')
        serializer = ProductSerializer(products, many=True)
        return Response({
            'success': True,
            'data': {'products': serializer.data}
        })
    
    elif request.method == 'POST':
        # Create new product
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            return Response({
                'success': True,
                'data': {'product': ProductSerializer(product).data}
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def update_product(request, product_id):
    """Update or delete product"""
    if not is_admin(request.user):
        return Response({
            'success': False,
            'message': 'Access denied. Admin privileges required.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Try to convert to int if it's a numeric string
        try:
            product_id_int = int(product_id)
            product = Product.objects.get(id=product_id_int)
        except (ValueError, Product.DoesNotExist):
            # If conversion fails or product not found, try as string
            product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Product not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'DELETE':
        # Delete product (hard delete)
        product.delete()
        return Response({
            'success': True,
            'message': 'Product deleted successfully'
        })
    
    # Update product (PUT or PATCH)
    serializer = ProductSerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        product = serializer.save()
        return Response({
            'success': True,
            'data': {'product': ProductSerializer(product).data}
        })
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_digital_keys(request):
    """Add digital keys (bulk)"""
    if not is_admin(request.user):
        return Response({
            'success': False,
            'message': 'Access denied. Admin privileges required.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    product_id = request.data.get('productId')
    keys = request.data.get('keys', [])
    region = request.data.get('region', 'Global')
    
    if not product_id or not keys:
        return Response({
            'success': False,
            'message': 'Product ID and keys are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Product not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    created_count = 0
    for key in keys:
        if key.strip():
            encrypted_key = encrypt_key(key.strip())
            DigitalKey.objects.create(
                product=product,
                encrypted_key=encrypted_key,
                region=region,
                is_used=False
            )
            created_count += 1
    
    # Update product stock
    product.stock += created_count
    product.save()
    
    return Response({
        'success': True,
        'data': {
            'keysAdded': created_count,
            'productStock': product.stock
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_orders(request):
    """Get all orders"""
    if not is_admin(request.user):
        return Response({
            'success': False,
            'message': 'Access denied. Admin privileges required.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    orders = Order.objects.select_related('user').prefetch_related('order_items__product')
    serializer = OrderSerializer(orders, many=True)
    return Response({
        'success': True,
        'data': {'orders': serializer.data}
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    """Update order status"""
    if not is_admin(request.user):
        return Response({
            'success': False,
            'message': 'Access denied. Admin privileges required.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Order not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    status_value = request.data.get('status')
    if status_value not in ['pending', 'processing', 'completed', 'cancelled']:
        return Response({
            'success': False,
            'message': 'Invalid status'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    order.status = status_value
    order.save()
    
    return Response({
        'success': True,
        'data': {'order': OrderSerializer(order).data}
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_promo_code(request):
    """Create promo code"""
    if not is_admin(request.user):
        return Response({
            'success': False,
            'message': 'Access denied. Admin privileges required.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = PromoCodeSerializer(data=request.data)
    if serializer.is_valid():
        promo_code = serializer.save()
        return Response({
            'success': True,
            'data': {'promoCode': PromoCodeSerializer(promo_code).data}
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_promo_codes(request):
    """Get all promo codes"""
    if not is_admin(request.user):
        return Response({
            'success': False,
            'message': 'Access denied. Admin privileges required.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    promoCodes = PromoCode.objects.all()
    serializer = PromoCodeSerializer(promoCodes, many=True)
    return Response({
        'success': True,
        'data': {'promoCodes': serializer.data}
    })



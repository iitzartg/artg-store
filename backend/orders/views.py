from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Order, DigitalKey
from .serializers import OrderSerializer
from utils.encryption import decrypt_key


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing orders.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Order.objects.all().select_related('user').prefetch_related('order_items__product', 'order_items__digital_key')
        return Order.objects.filter(user=user).select_related('user').prefetch_related('order_items__product', 'order_items__digital_key')

    @action(detail=True, methods=['get'])
    def keys(self, request, pk=None):
        """Get digital keys for an order (one-time view)"""
        order = self.get_object()
        
        # Check if order belongs to user or user is admin
        if order.user != request.user and request.user.role != 'admin':
            return Response({
                'success': False,
                'message': 'Not authorized to access this order'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if order is completed
        if order.status != 'completed' or order.payment_status != 'succeeded':
            return Response({
                'success': False,
                'message': 'Order is not completed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract and decrypt keys
        keys = []
        for item in order.order_items.all():
            if item.digital_key:
                try:
                    decrypted_key = decrypt_key(item.digital_key.encrypted_key)
                    keys.append({
                        'productName': item.product.title,
                        'key': decrypted_key,
                        'region': item.digital_key.region,
                        'isUsed': item.digital_key.is_used
                    })
                except Exception as e:
                    print(f'Error decrypting key: {e}')
        
        return Response({
            'success': True,
            'data': {'keys': keys},
            'warning': 'These keys are shown only once. Please save them securely.'
        })



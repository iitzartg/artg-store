import stripe
import json
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse, HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from products.models import Product
from orders.models import Order, OrderItem, DigitalKey, PromoCode
from utils.encryption import encrypt_key
from utils.email import send_digital_keys_email, send_order_confirmation_email

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Create Stripe payment intent"""
    items = request.data.get('items', [])
    promo_code = request.data.get('promoCode')

    if not items or not isinstance(items, list):
        return Response({
            'success': False,
            'message': 'Cart items are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Calculate totals
    subtotal = 0
    order_items = []

    for item in items:
        try:
            product = Product.objects.get(id=item['productId'], is_active=True)
        except Product.DoesNotExist:
            return Response({
                'success': False,
                'message': f"Product {item['productId']} not found or inactive"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check stock
        if product.stock < item['quantity']:
            return Response({
                'success': False,
                'message': f'Insufficient stock for {product.title}'
            }, status=status.HTTP_400_BAD_REQUEST)

        item_price = float(product.price) * (1 - product.discount / 100)
        item_total = item_price * item['quantity']
        subtotal += item_total

        order_items.append({
            'product': str(product.id),
            'quantity': item['quantity'],
            'price': item_price
        })

    # Apply promo code if provided
    discount = 0
    if promo_code:
        try:
            promo = PromoCode.objects.get(
                code=promo_code.upper(),
                is_active=True
            )
            
            if promo.usage_limit and promo.used_count >= promo.usage_limit:
                return Response({
                    'success': False,
                    'message': 'Promo code has reached usage limit'
                }, status=status.HTTP_400_BAD_REQUEST)

            if subtotal >= float(promo.min_purchase):
                if promo.discount_type == 'percentage':
                    discount = (subtotal * float(promo.discount_value)) / 100
                    if promo.max_discount:
                        discount = min(discount, float(promo.max_discount))
                else:
                    discount = float(promo.discount_value)
        except PromoCode.DoesNotExist:
            pass

    tax = subtotal * 0.1  # 10% tax
    total = subtotal + tax - discount

    # Create payment intent
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=int(total * 100),  # Convert to cents
            currency='usd',
            metadata={
                'userId': str(request.user.id),
                'orderItems': json.dumps(order_items)
            }
        )

        return Response({
            'success': True,
            'data': {
                'clientSecret': payment_intent.client_secret,
                'paymentIntentId': payment_intent.id,
                'amount': total
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    """Stripe webhook handler"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        handle_successful_payment(payment_intent)

    return JsonResponse({'received': True})


def handle_successful_payment(payment_intent):
    """Handle successful payment - create order and assign keys"""
    from accounts.models import User
    
    user_id = payment_intent['metadata']['userId']
    order_items_data = json.loads(payment_intent['metadata']['orderItems'])

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        print(f'User {user_id} not found')
        return

    # Calculate totals
    subtotal = 0
    populated_items = []

    for item_data in order_items_data:
        try:
            product = Product.objects.get(id=item_data['productId'])
        except Product.DoesNotExist:
            continue

        item_price = float(product.price) * (1 - product.discount / 100)
        item_total = item_price * item_data['quantity']
        subtotal += item_total

        # Find available digital keys
        available_keys = DigitalKey.objects.filter(
            product=product,
            is_used=False,
            order__isnull=True,
            region=product.region
        )[:item_data['quantity']]

        if available_keys.count() < item_data['quantity']:
            print(f'Insufficient keys for product {product.title}')
            continue

        # Mark keys as used
        key_to_assign = available_keys.first()
        for key in available_keys:
            key.is_used = True
            key.save()

        populated_items.append({
            'product': product,
            'quantity': item_data['quantity'],
            'price': item_price,
            'digital_key': key_to_assign
        })

        # Update product stock
        product.stock -= item_data['quantity']
        product.save()

    tax = subtotal * 0.1
    total = subtotal + tax

    # Create order
    order = Order.objects.create(
        user=user,
        payment_intent_id=payment_intent['id'],
        payment_status='succeeded',
        status='completed',
        subtotal=subtotal,
        tax=tax,
        total=total,
        keys_delivered=False
    )

    # Create order items and assign keys
    keys_for_email = []
    for item_data in populated_items:
        order_item = OrderItem.objects.create(
            order=order,
            product=item_data['product'],
            quantity=item_data['quantity'],
            price=item_data['price'],
            digital_key=item_data['digital_key']
        )
        
        # Update key with order and user
        if item_data['digital_key']:
            item_data['digital_key'].order = order
            item_data['digital_key'].user = user
            item_data['digital_key'].save()
            
            # Decrypt key for email
            try:
                decrypted_key = decrypt_key(item_data['digital_key'].encrypted_key)
                keys_for_email.append({
                    'productName': item_data['product'].title,
                    'key': decrypted_key
                })
            except Exception as e:
                print(f'Error decrypting key for email: {e}')

    # Send email with keys
    if keys_for_email:
        try:
            send_digital_keys_email(user.email, order.id, keys_for_email)
            send_order_confirmation_email(user.email, order.id, total)
            order.keys_delivered = True
            order.save()
        except Exception as e:
            print(f'Error sending email: {e}')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """Verify payment and create order"""
    payment_intent_id = request.data.get('paymentIntentId')

    if not payment_intent_id:
        return Response({
            'success': False,
            'message': 'Payment intent ID is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

        if payment_intent.status != 'succeeded':
            return Response({
                'success': False,
                'message': 'Payment not completed'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if order already exists
        existing_order = Order.objects.filter(payment_intent_id=payment_intent_id).first()
        if existing_order:
            return Response({
                'success': True,
                'data': {'order': existing_order.id},
                'message': 'Order already exists'
            })

        return Response({
            'success': True,
            'message': 'Payment verified. Order processing...'
        })
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



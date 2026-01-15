from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg, Count
from .models import Product, Review
from .serializers import ProductSerializer, ProductListSerializer, ReviewSerializer, ReviewListSerializer, get_product_id_from_instance
import django_filters


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    
    class Meta:
        model = Product
        fields = ['product_type', 'platform', 'category', 'region', 'featured']


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing products.
    """
    queryset = Product.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product_type', 'platform', 'category', 'region', 'featured']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'price']
    ordering = ['-created_at']
    lookup_field = 'pk'  # Explicitly set lookup field (maps to _id in djongo)

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def get_object(self):
        """
        Override get_object to handle MongoDB ObjectId lookups properly.
        With djongo, pk maps to _id, but we need to ensure string ObjectIds work correctly.
        """
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        if not lookup_value:
            from rest_framework.exceptions import NotFound
            raise NotFound('Product ID is required')
        
        # Get base queryset (without filters that might exclude the product)
        queryset = self.get_queryset()
        
        # Convert lookup_value to string for consistency
        lookup_value_str = str(lookup_value)
        
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f'Looking up product with ID: {lookup_value_str} (type: {type(lookup_value)})')
        
        # Try multiple lookup methods for MongoDB compatibility
        try:
            # Method 1: Try using pk with string value (djongo maps pk to _id)
            try:
                obj = queryset.get(pk=lookup_value_str)
                logger.info(f'Found product using pk lookup: {obj.title}')
                return obj
            except (Product.DoesNotExist, ValueError, TypeError) as e:
                logger.debug(f'Method 1 (pk=str) failed: {type(e).__name__}: {e}')
                pass
            
            # Method 2: Try using _id field directly (MongoDB)
            try:
                obj = queryset.get(_id=lookup_value_str)
                logger.info(f'Found product using _id lookup: {obj.title}')
                return obj
            except (Product.DoesNotExist, ValueError, TypeError, AttributeError) as e:
                logger.debug(f'Method 2 (_id=str) failed: {type(e).__name__}: {e}')
                pass
            
            # Method 3: Try converting to ObjectId if it's a valid ObjectId string
            try:
                from bson import ObjectId
                if ObjectId.is_valid(lookup_value_str):
                    object_id = ObjectId(lookup_value_str)
                    obj = queryset.get(_id=object_id)
                    logger.info(f'Found product using ObjectId conversion: {obj.title}')
                    return obj
            except (Product.DoesNotExist, ValueError, TypeError, AttributeError) as e:
                logger.debug(f'Method 3 (ObjectId conversion) failed: {type(e).__name__}: {e}')
                pass
            except ImportError:
                logger.debug('bson.ObjectId not available, skipping ObjectId conversion')
                pass
            
            # If all methods fail, log detailed error
            logger.warning(f'Could not find product with ID: {lookup_value_str}. Tried all lookup methods.')
            
            # Log some debug info about available products
            try:
                sample_products = list(queryset[:5])
                sample_ids = []
                for p in sample_products:
                    try:
                        pk_val = str(getattr(p, 'pk', 'unknown'))
                        _id_val = str(getattr(p, '_id', 'unknown'))
                        sample_ids.append(f'pk={pk_val}, _id={_id_val}')
                    except Exception:
                        sample_ids.append('error getting ID')
                logger.debug(f'Sample product IDs in queryset: {sample_ids}')
            except Exception as debug_error:
                logger.debug(f'Error getting sample products: {debug_error}')
            
            from rest_framework.exceptions import NotFound
            raise NotFound(f'Product with ID {lookup_value_str} not found')
            
        except NotFound:
            # Re-raise NotFound exceptions
            raise
        except Exception as e:
            logger.error(f'Unexpected error getting product object: {e}', exc_info=True)
            from rest_framework.exceptions import NotFound
            raise NotFound('Error retrieving product')

    def get_queryset(self):
        # Workaround for djongo boolean filter issue with is_active
        # We'll filter is_active in the list method instead
        queryset = Product.objects.all()
        
        # Price range filter (these work fine with djongo)
        # Divide by 3.2 since we multiply prices by 3.2 when displaying
        min_price = self.request.query_params.get('minPrice', '').strip()
        max_price = self.request.query_params.get('maxPrice', '').strip()
        
        if min_price:
            try:
                min_price_float = float(min_price)
                if min_price_float >= 0:  # Allow 0 as minimum
                    min_price_value = min_price_float / 3.2
                    queryset = queryset.filter(price__gte=min_price_value)
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.info(f'Applied minPrice filter: {min_price} TND (stored: {min_price_value})')
            except (ValueError, TypeError) as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f'Invalid minPrice value: {min_price}, error: {e}')
        
        if max_price:
            try:
                max_price_float = float(max_price)
                if max_price_float > 0:
                    max_price_value = max_price_float / 3.2
                    queryset = queryset.filter(price__lte=max_price_value)
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.info(f'Applied maxPrice filter: {max_price} TND (stored: {max_price_value})')
            except (ValueError, TypeError) as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f'Invalid maxPrice value: {max_price}, error: {e}')
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override list to return custom response format"""
        # Get the base queryset with price filters already applied
        base_queryset = self.get_queryset()
        
        # Apply other filters (product_type, category, etc.) using filter_queryset
        # But we need to exclude price filters since they're already in get_queryset
        queryset = self.filter_queryset(base_queryset)
        
        # Get all products first (without is_active filter)
        try:
            # Try to get products and filter in Python after serialization
            all_products_list = []
            total_before_filter = 0
            for product in queryset:
                total_before_filter += 1
                try:
                    # Check is_active attribute
                    is_active = getattr(product, 'is_active', None)
                    # If is_active is explicitly False, skip it
                    # If it's None or True, include it
                    if is_active is not False:
                        all_products_list.append(product)
                except Exception as e:
                    # If we can't check is_active, include the product to be safe
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f'Error checking is_active for product {getattr(product, "id", "unknown")}: {e}')
                    all_products_list.append(product)
            
            # Log for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f'Products query: total={total_before_filter}, active={len(all_products_list)}')
            
            if not all_products_list:
                # Log that no products were found
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f'No active products found. Total products in queryset: {total_before_filter}')
                return Response({
                    'success': True,
                    'data': {
                        'products': [],
                        'pagination': {
                            'page': request.query_params.get('page', '1'),
                            'limit': request.query_params.get('limit', '12'),
                            'total': 0,
                            'pages': 0
                        }
                    }
                })
            
            # Manual pagination with validation
            try:
                page = int(request.query_params.get('page', '1'))
                limit = int(request.query_params.get('limit', '12'))
            except (ValueError, TypeError):
                page = 1
                limit = 12
            
            # Validate and constrain values
            page = max(1, page)  # Ensure page is at least 1
            limit = max(1, min(100, limit))  # Limit between 1 and 100
            
            total = len(all_products_list)
            pages = (total + limit - 1) // limit if limit > 0 else 1
            
            # Ensure page doesn't exceed total pages
            page = min(page, pages) if pages > 0 else 1
            
            start = (page - 1) * limit
            end = start + limit
            paginated_products = all_products_list[start:end]
            
            # Serialize with error handling
            import logging
            logger = logging.getLogger(__name__)
            products_data = []
            
            # Serialize products one by one to catch and log any errors
            for product in paginated_products:
                try:
                    product_serializer = self.get_serializer(product)
                    product_data = product_serializer.data
                    
                    # Ensure product has _id before adding
                    if '_id' in product_data and product_data['_id']:
                        products_data.append(product_data)
                    else:
                        # Try to get ID one more time
                        _id_value = get_product_id_from_instance(product)
                        if _id_value:
                            product_data['_id'] = str(_id_value)
                            products_data.append(product_data)
                        else:
                            logger.warning(f'Skipping product "{getattr(product, "title", "unknown")}" - no valid ID')
                            
                except Exception as product_error:
                    logger.error(f'Error serializing product "{getattr(product, "title", "unknown")}": {product_error}', exc_info=True)
                    # Try to create a minimal representation
                    try:
                        minimal_product = {
                            '_id': str(get_product_id_from_instance(product) or 'unknown'),
                            'title': getattr(product, 'title', 'Unknown Product'),
                            'description': getattr(product, 'description', ''),
                            'price': float(getattr(product, 'price', 0)) * 3.2,
                            'productType': getattr(product, 'product_type', 'GAME'),
                            'platform': getattr(product, 'platform', 'PC'),
                            'category': getattr(product, 'category', 'Action'),
                            'images': getattr(product, 'images', []),
                            'isDigital': getattr(product, 'is_digital', True),
                            'isActive': getattr(product, 'is_active', True),
                            'stock': getattr(product, 'stock', 0),
                            'featured': getattr(product, 'featured', False),
                            'discount': getattr(product, 'discount', 0),
                        }
                        if minimal_product['_id'] != 'unknown':
                            products_data.append(minimal_product)
                    except Exception as minimal_error:
                        logger.error(f'Could not create minimal product representation: {minimal_error}')
            
            # Update total and pages based on actual serialized products
            # This ensures pagination reflects what was actually returned
            actual_total = len(products_data)
            if actual_total < total:
                # If we lost some products during serialization, adjust totals
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f'Serialized {actual_total} products out of {total} attempted. Some products may have been skipped due to serialization errors.')
            
            return Response({
                'success': True,
                'data': {
                    'products': products_data,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': len(all_products_list),  # Total products that passed is_active filter
                        'pages': pages
                    }
                }
            })
            
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Error in products list view: {e}', exc_info=True)
            
            # If everything fails, try standard DRF pagination without is_active filter
            # This will show all products (including inactive ones) but at least something will show
            try:
                page_num = int(request.query_params.get('page', '1'))
                limit_num = int(request.query_params.get('limit', '12'))
            except (ValueError, TypeError):
                page_num = 1
                limit_num = 12
            
            # Validate and constrain values
            page_num = max(1, page_num)
            limit_num = max(1, min(100, limit_num))
            
            try:
                page = self.paginate_queryset(queryset)
                if page is not None:
                    try:
                        serializer = self.get_serializer(page, many=True)
                        paginated_response = self.get_paginated_response(serializer.data)
                        
                        total_count = paginated_response.data['count']
                        total_pages = (total_count + limit_num - 1) // limit_num if limit_num > 0 else 1
                        page_num = min(page_num, total_pages) if total_pages > 0 else 1
                        
                        return Response({
                            'success': True,
                            'data': {
                                'products': paginated_response.data['results'],
                                'pagination': {
                                    'page': page_num,
                                    'limit': limit_num,
                                    'total': total_count,
                                    'pages': total_pages
                                }
                            }
                        })
                    except Exception as serialization_error:
                        logger.error(f'Error serializing paginated products: {serialization_error}', exc_info=True)
                        raise
                
                # Fallback: serialize all products
                try:
                    serializer = self.get_serializer(queryset, many=True)
                    return Response({
                        'success': True,
                        'data': {
                            'products': serializer.data,
                            'pagination': {
                                'page': 1,
                                'limit': len(serializer.data),
                                'total': len(serializer.data),
                                'pages': 1
                            }
                        }
                    })
                except Exception as serialization_error:
                    logger.error(f'Error serializing all products: {serialization_error}', exc_info=True)
                    # Last resort: return empty response
                    return Response({
                        'success': False,
                        'message': 'Error loading products. Please check server logs.',
                        'data': {
                            'products': [],
                            'pagination': {
                                'page': 1,
                                'limit': 12,
                                'total': 0,
                                'pages': 0
                            }
                        }
                    }, status=500)
            except Exception as fallback_error:
                logger.error(f'Error in fallback pagination: {fallback_error}', exc_info=True)
                # Last resort: return empty response
                return Response({
                    'success': False,
                    'message': 'Error loading products. Please check server logs.',
                    'data': {
                        'products': [],
                        'pagination': {
                            'page': 1,
                            'limit': 12,
                            'total': 0,
                            'pages': 0
                        }
                    }
                }, status=500)
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to return custom response format"""
        instance = self.get_object()
        
        # Check if product is active - use same workaround as list method
        try:
            is_active = getattr(instance, 'is_active', None)
            # If is_active is explicitly False, return 404
            if is_active is False:
                return Response({
                    'success': False,
                    'message': 'Product not found'
                }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # If we can't check is_active, log warning but continue
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f'Error checking is_active for product {getattr(instance, "id", "unknown")}: {e}')
        
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': {'product': serializer.data}
        })

    @action(detail=False, methods=['get'], url_path='featured/all')
    def featured(self, request):
        """Get random featured products from database"""
        queryset = self.get_queryset()
        # Filter active products - use same workaround as list method
        active_products = []
        for product in queryset:
            try:
                # Check is_active attribute - if it's explicitly False, skip it
                # If it's None or True, include it
                is_active = getattr(product, 'is_active', None)
                if is_active is not False:
                    active_products.append(product)
            except Exception:
                # If we can't check is_active, include the product to be safe
                active_products.append(product)
        
        if not active_products:
            return Response({
                'success': True,
                'data': {'products': []}
            })
        # Get random sample
        import random
        products = random.sample(active_products, min(10, len(active_products)))
        
        # Serialize with error handling
        try:
            serializer = self.get_serializer(products, many=True)
            products_data = serializer.data
        except Exception as e:
            # Log the serialization error
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Error serializing featured products: {e}', exc_info=True)
            
            # Try to serialize products one by one to identify the problematic one
            products_data = []
            for product in products:
                try:
                    product_serializer = self.get_serializer(product)
                    products_data.append(product_serializer.data)
                except Exception as product_error:
                    logger.error(f'Error serializing featured product "{getattr(product, "title", "unknown")}": {product_error}')
                    # Skip this product but continue with others
                    continue
        
        return Response({
            'success': True,
            'data': {'products': products_data}
        })

    @action(detail=False, methods=['get'], url_path='platform/(?P<platform>[^/.]+)')
    def by_platform(self, request, platform=None):
        """Get products by platform"""
        queryset = self.get_queryset().filter(platform=platform)
        # Filter active products
        active_products = [p for p in queryset if p.is_active]
        serializer = self.get_serializer(active_products, many=True)
        return Response({
            'success': True,
            'data': {'products': serializer.data}
        })


class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing reviews.
    """
    queryset = Review.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'rating']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return ReviewListSerializer
        return ReviewSerializer

    def get_permissions(self):
        """Allow anyone to read reviews, but require auth to create/update/delete"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        """Filter reviews by product if product_id is provided"""
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product')
        if product_id:
            # Try multiple lookup methods for MongoDB ObjectId compatibility
            try:
                # Method 1: Try direct product_id filter
                queryset = queryset.filter(product_id=product_id)
            except (ValueError, TypeError):
                # Method 2: Try with string conversion
                try:
                    queryset = queryset.filter(product_id=str(product_id))
                except Exception:
                    # Method 3: Try with ObjectId conversion
                    try:
                        from bson import ObjectId
                        if ObjectId.is_valid(str(product_id)):
                            queryset = queryset.filter(product_id=ObjectId(str(product_id)))
                    except (ImportError, ValueError, TypeError):
                        pass
        # Note: select_related doesn't work with djongo/MongoDB, so we remove it
        return queryset

    def create(self, request, *args, **kwargs):
        """Create a new review"""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        # Get product from validated data - handle both Product instance and ID
        product = serializer.validated_data.get('product')
        if hasattr(product, 'id'):
            product_id = product.id
        elif hasattr(product, 'pk'):
            product_id = product.pk
        else:
            # If product is just an ID, try to get the Product object
            try:
                product_obj = Product.objects.get(pk=product)
                product_id = product_obj.pk
            except (Product.DoesNotExist, ValueError, TypeError):
                # Try with ObjectId conversion
                try:
                    from bson import ObjectId
                    if ObjectId.is_valid(str(product)):
                        product_obj = Product.objects.get(_id=ObjectId(str(product)))
                        product_id = product_obj.pk
                    else:
                        return Response({
                            'success': False,
                            'message': 'Invalid product ID'
                        }, status=status.HTTP_400_BAD_REQUEST)
                except (Product.DoesNotExist, ImportError, ValueError, TypeError):
                    return Response({
                        'success': False,
                        'message': 'Product not found'
                    }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already reviewed this product - try multiple lookup methods
        existing_review = None
        try:
            # Try direct lookup
            existing_review = Review.objects.filter(user=request.user, product_id=product_id).first()
        except (ValueError, TypeError):
            try:
                # Try with string conversion
                existing_review = Review.objects.filter(user=request.user, product_id=str(product_id)).first()
            except Exception:
                try:
                    # Try with ObjectId conversion
                    from bson import ObjectId
                    if ObjectId.is_valid(str(product_id)):
                        existing_review = Review.objects.filter(user=request.user, product_id=ObjectId(str(product_id))).first()
                except (ImportError, ValueError, TypeError):
                    pass
        
        if existing_review:
            return Response({
                'success': False,
                'message': 'You have already reviewed this product'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user purchased the product (for verified badge)
        try:
            from orders.models import Order
            has_purchased = Order.objects.filter(
                user=request.user,
                order_items__product_id=product_id,
                status='completed'
            ).distinct().exists()
        except Exception:
            # If orders app is not available or query fails, default to False
            has_purchased = False
        
        review = serializer.save(is_verified=has_purchased)
        serializer = ReviewSerializer(review, context={'request': request})
        
        return Response({
            'success': True,
            'data': {'review': serializer.data}
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update a review (only by the owner)"""
        instance = self.get_object()
        if instance.user != request.user:
            return Response({
                'success': False,
                'message': 'You can only update your own reviews'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(instance, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'success': True,
            'data': {'review': serializer.data}
        })

    def destroy(self, request, *args, **kwargs):
        """Delete a review (only by the owner or admin)"""
        instance = self.get_object()
        if instance.user != request.user and not request.user.is_staff:
            return Response({
                'success': False,
                'message': 'You can only delete your own reviews'
            }, status=status.HTTP_403_FORBIDDEN)
        
        instance.delete()
        return Response({
            'success': True,
            'message': 'Review deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)

    def list(self, request, *args, **kwargs):
        """Override list to return custom response format"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Get rating statistics
        product_id = request.query_params.get('product')
        stats = {}
        if product_id:
            try:
                # Try to get reviews for this product with multiple lookup methods
                review_queryset = Review.objects.all()
                
                # Try filtering with different methods
                try:
                    review_queryset = review_queryset.filter(product_id=product_id)
                except (ValueError, TypeError):
                    try:
                        review_queryset = review_queryset.filter(product_id=str(product_id))
                    except Exception:
                        try:
                            from bson import ObjectId
                            if ObjectId.is_valid(str(product_id)):
                                review_queryset = review_queryset.filter(product_id=ObjectId(str(product_id)))
                        except (ImportError, ValueError, TypeError):
                            review_queryset = Review.objects.none()
                
                # Convert to list for manual aggregation (djongo doesn't support all aggregate functions)
                reviews_list = list(review_queryset)
                
                if reviews_list:
                    # Calculate average rating manually
                    total_rating = sum(r.rating for r in reviews_list)
                    stats['average_rating'] = total_rating / len(reviews_list)
                    stats['total_reviews'] = len(reviews_list)
                    
                    # Calculate rating distribution manually
                    rating_distribution = {}
                    for review in reviews_list:
                        rating = review.rating
                        rating_distribution[rating] = rating_distribution.get(rating, 0) + 1
                    stats['rating_distribution'] = rating_distribution
                else:
                    stats['average_rating'] = 0
                    stats['total_reviews'] = 0
                    stats['rating_distribution'] = {}
                    
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f'Error calculating review stats: {e}', exc_info=True)
                stats = {
                    'average_rating': 0,
                    'total_reviews': 0,
                    'rating_distribution': {}
                }
        
        # Manual pagination with validation
        try:
            page_num = int(request.query_params.get('page', '1'))
            limit_num = int(request.query_params.get('limit', '10'))
        except (ValueError, TypeError):
            page_num = 1
            limit_num = 10
        
        # Validate and constrain values
        page_num = max(1, page_num)
        limit_num = max(1, min(100, limit_num))
        
        # Convert queryset to list for manual pagination
        reviews_list = list(queryset)
        total_count = len(reviews_list)
        total_pages = (total_count + limit_num - 1) // limit_num if limit_num > 0 else 1
        
        # Ensure page doesn't exceed total pages
        page_num = min(page_num, total_pages) if total_pages > 0 else 1
        
        # Calculate pagination slice
        start = (page_num - 1) * limit_num
        end = start + limit_num
        paginated_reviews = reviews_list[start:end]
        
        # Serialize paginated reviews
        serializer = self.get_serializer(paginated_reviews, many=True)
        
        return Response({
            'success': True,
            'data': {
                'reviews': serializer.data,
                'stats': stats,
                'pagination': {
                    'page': page_num,
                    'limit': limit_num,
                    'total': total_count,
                    'pages': total_pages
                }
            }
        })


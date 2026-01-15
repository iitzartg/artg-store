from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'data': {
                'user': UserSerializer(user).data,
                'token': str(refresh.access_token),
                'refreshToken': str(refresh)
            }
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        # Store refresh token
        user.refresh_token = str(refresh)
        user.save(update_fields=['refresh_token'])
        
        return Response({
            'success': True,
            'data': {
                'user': UserSerializer(user).data,
                'token': str(refresh.access_token),
                'refreshToken': str(refresh)
            }
        })
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """Refresh access token"""
    refresh_token = request.data.get('refreshToken')
    
    if not refresh_token:
        return Response({
            'success': False,
            'message': 'Refresh token required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        refresh = RefreshToken(refresh_token)
        user = User.objects.get(id=refresh['user_id'])
        
        if user.refresh_token != refresh_token:
            return Response({
                'success': False,
                'message': 'Invalid refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate new tokens
        new_refresh = RefreshToken.for_user(user)
        user.refresh_token = str(new_refresh)
        user.save(update_fields=['refresh_token'])
        
        return Response({
            'success': True,
            'data': {
                'token': str(new_refresh.access_token),
                'refreshToken': str(new_refresh)
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Invalid refresh token'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current authenticated user"""
    return Response({
        'success': True,
        'data': {
            'user': UserSerializer(request.user).data
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user (clear refresh token)"""
    request.user.refresh_token = None
    request.user.save(update_fields=['refresh_token'])
    
    return Response({
        'success': True,
        'message': 'Logged out successfully'
    })



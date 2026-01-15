import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { Product, Review } from '../types';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import ReviewList from '../components/product/ReviewList';
import ReviewForm from '../components/product/ReviewForm';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchProduct();
    if (id && isAuthenticated) {
      fetchUserReview();
    }
  }, [id, isAuthenticated]);

  const fetchProduct = async () => {
    if (!id) {
      toast.error('Invalid product ID');
      navigate('/products');
      return;
    }
    
    console.log('Fetching product with ID:', id);
    try {
      const response = await api.get(`/products/${id}`);
      console.log('Product API response:', response.data);
      if (response.data?.data?.product) {
        setProduct(response.data.data.product);
        console.log('Product loaded successfully:', response.data.data.product.title);
      } else {
        console.error('Unexpected response format:', response.data);
        toast.error('Product data format error');
        setTimeout(() => {
          navigate('/products');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || error.message || 'Product not found';
      toast.error(errorMessage);
      // Don't navigate immediately - let user see the error
      setTimeout(() => {
        navigate('/products');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    if (!id || !user) return;
    
    try {
      const response = await api.get(`/products/reviews?product=${id}`);
      const reviews = response.data.data.reviews || [];
      const review = reviews.find((r: Review) => r.user._id === user.id);
      setUserReview(review || null);
    } catch (error) {
      console.error('Error fetching user review:', error);
    }
  };

  const handleReviewSubmitted = () => {
    // Reset review page to 1 when a new review is submitted
    const params = new URLSearchParams(searchParams);
    params.set('reviewPage', '1');
    setSearchParams(params, { replace: true });
    setRefreshReviews(prev => prev + 1);
    fetchUserReview();
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      productId: product._id,
      title: product.title,
      price: product.price * (1 - product.discount / 100),
      quantity,
      image: product.images[0],
      platform: product.platform,
    });
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-96 bg-gray-700 rounded-lg mb-6"></div>
        <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400 text-lg mb-4">Product not found</p>
        <button
          onClick={() => navigate('/products')}
          className="btn-secondary"
        >
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const discountedPrice = product.price * (1 - product.discount / 100);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <img
            src={product.images[0] || '/placeholder-game.jpg'}
            alt={product.title}
            className="w-full rounded-lg mb-4"
          />
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.title} ${idx + 2}`}
                  className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-400">{product.platform}</span>
              <span className="text-gray-600">•</span>
              <span className="text-sm text-gray-400">{product.category}</span>
              <span className="text-gray-600">•</span>
              <span className="text-sm text-gray-400">{product.productType}</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              {product.discount > 0 ? (
                <div>
                  <span className="text-4xl font-bold text-neon-green">
                    {discountedPrice.toFixed(2)} TND
                  </span>
                  <span className="text-xl text-gray-500 line-through ml-3">
                    {product.price.toFixed(2)} TND
                  </span>
                  <span className="ml-3 bg-neon-green text-gray-900 px-2 py-1 rounded font-bold">
                    -{product.discount}%
                  </span>
                </div>
              ) : (
                <span className="text-4xl font-bold">{product.price.toFixed(2)} TND</span>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <p className="text-gray-300 leading-relaxed">{product.description}</p>
          </div>

          <div className="card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Stock:</span>
                <span className={product.stock > 0 ? 'text-neon-green' : 'text-red-400'}>
                  {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Region:</span>
                <span>{product.region}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Delivery:</span>
                <span className="text-neon-green">Instant Digital Delivery</span>
              </div>
            </div>
          </div>

          {product.stock > 0 && (
            <div className="card">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-gray-400">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="input-field w-20 text-center"
                />
              </div>
              <button
                onClick={handleAddToCart}
                className="btn-primary w-full flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div id="reviews-section" className="space-y-6">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        
        {/* Review Form */}
        {isAuthenticated ? (
          <ReviewForm
            productId={product._id}
            onReviewSubmitted={handleReviewSubmitted}
            existingReview={userReview ? {
              _id: userReview._id,
              rating: userReview.rating,
              comment: userReview.comment,
            } : undefined}
          />
        ) : (
          <div className="card bg-gray-800/50 border border-gray-700">
            <div className="text-center py-6">
              <p className="text-gray-300 mb-4">
                Want to share your experience with this product?
              </p>
              <Link
                to="/login"
                className="btn-primary inline-flex items-center"
              >
                Login to Write a Review
              </Link>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <ReviewList key={refreshReviews} productId={product._id} />
      </div>
    </div>
  );
};

export default ProductDetail;




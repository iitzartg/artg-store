import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, CheckCircle, Trash2, Edit2 } from 'lucide-react';
import api from '../../utils/api';
import { Review, ReviewStats } from '../../types';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface ReviewListProps {
  productId: string;
}

const ReviewList = ({ productId }: ReviewListProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { user, isAuthenticated } = useAuthStore();

  // Get page from URL params, default to 1
  const page = parseInt(searchParams.get('reviewPage') || '1', 10);

  // Scroll to reviews section when page changes
  useEffect(() => {
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback to scrolling to top if reviews section not found
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams.get('reviewPage')]);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, searchParams.get('reviewPage')]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      console.log('Fetching reviews for product:', productId);
      const response = await api.get(`/products/reviews?product=${productId}&page=${page}&limit=10`);
      console.log('Reviews API response:', response.data);
      
      if (!response.data || !response.data.data) {
        console.error('Unexpected response format:', response.data);
        setReviews([]);
        setStats(null);
        setTotalPages(1);
        return;
      }
      
      setReviews(response.data.data.reviews || []);
      setStats(response.data.data.stats || null);
      const paginationData = response.data.data.pagination;
      setTotalPages(paginationData?.pages || 1);
      
      // If current page exceeds total pages, reset to page 1
      if (paginationData && page > paginationData.pages && paginationData.pages > 0) {
        const params = new URLSearchParams(searchParams);
        params.set('reviewPage', '1');
        setSearchParams(params, { replace: true });
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        productId: productId
      });
      
      // Don't show error toast if it's just that there are no reviews
      // Only show error if it's a real error (not 404 or empty response)
      if (error.response?.status !== 404 && error.response?.status !== 200) {
        toast.error(error.response?.data?.message || 'Failed to load reviews');
      }
      
      // Set empty state on error
      setReviews([]);
      setStats(null);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/products/reviews/${reviewId}`);
      toast.success('Review deleted');
      // Reset to page 1 after deletion to avoid empty pages
      const params = new URLSearchParams(searchParams);
      params.set('reviewPage', '1');
      setSearchParams(params, { replace: true });
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
        }`}
      />
    ));
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-b border-gray-700 pb-4">
              <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      {stats && stats.total_reviews && stats.total_reviews > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold">
                  {stats.average_rating?.toFixed(1) || '0.0'}
                </span>
                <div className="flex items-center">
                  {renderStars(Math.round(stats.average_rating || 0))}
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Based on {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            {stats.rating_distribution && (
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.rating_distribution![rating] || 0;
                  const percentage = stats.total_reviews
                    ? (count / stats.total_reviews) * 100
                    : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2 text-sm">
                      <span className="w-8 text-gray-400">{rating}★</span>
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-400 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">
          Reviews {stats?.total_reviews ? `(${stats.total_reviews})` : ''}
        </h3>

        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-700 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{review.user.name}</span>
                      {review.isVerified && (
                        <span className="flex items-center gap-1 text-xs text-neon-green">
                          <CheckCircle className="w-4 h-4" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                  {isAuthenticated && (user?.id === review.user._id || user?._id === review.user._id) && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('reviewPage', (page - 1).toString());
                setSearchParams(params, { replace: true });
              }}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="flex items-center px-4">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('reviewPage', (page + 1).toString());
                setSearchParams(params, { replace: true });
              }}
              disabled={page >= totalPages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;

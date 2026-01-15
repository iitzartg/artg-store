import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import api from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
  existingReview?: {
    _id: string;
    rating: number;
    comment: string;
  };
}

const ReviewForm = ({ productId, onReviewSubmitted, existingReview }: ReviewFormProps) => {
  const { isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="card">
        <p className="text-gray-400 text-center">
          Please <a href="/login" className="text-purple-400 hover:underline">login</a> to leave a review
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      if (existingReview) {
        // Update existing review
        await api.put(`/products/reviews/${existingReview._id}`, {
          rating,
          comment: comment.trim(),
        });
        toast.success('Review updated successfully');
      } else {
        // Create new review
        await api.post('/products/reviews', {
          product: productId,
          rating,
          comment: comment.trim(),
        });
        toast.success('Review submitted successfully');
      }
      
      setRating(0);
      setComment('');
      onReviewSubmitted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={i}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 ${
              isFilled
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-600 hover:text-yellow-400'
            } transition-colors`}
          />
        </button>
      );
    });
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Rating *</label>
          <div className="flex items-center gap-2">{renderStars()}</div>
          {rating > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Your Review (optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            maxLength={1000}
            className="input-field resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{comment.length}/1000 characters</p>
        </div>

        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="btn-primary w-full flex items-center justify-center disabled:opacity-50"
        >
          <Send className="w-5 h-5 mr-2" />
          {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;

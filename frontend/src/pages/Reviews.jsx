import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiStar } from 'react-icons/fi';
import api from '../utils/axios';

export default function Reviews() {
  const { classId } = useParams();
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchReviews();
    fetchAverageRating();
  }, [classId]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/${classId}`);
      setReviews(response.data);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const response = await api.get(`/reviews/${classId}/average`);
      setAverageRating(response.data.averageRating);
    } catch (error) {
      console.error('Failed to fetch average rating:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/reviews', {
        ...newReview,
        classId
      });
      setReviews([response.data, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
      toast.success('Review submitted successfully');
      fetchAverageRating();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 to-transparent"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 to-transparent"></div>
      <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl animate-float"></div>
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 blur-3xl animate-float-slow"></div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2 tracking-wide">
            Class Reviews
          </h2>
          <div className="flex items-center">
            <span className="text-3xl font-bold text-white mr-2">{averageRating.toFixed(1)}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-6 h-6 ${
                    star <= Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-400'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-400">({reviews.length} reviews)</span>
          </div>
        </div>

        {currentUser && (
          <form onSubmit={handleSubmitReview} className="mb-8 p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-4 tracking-wide">Write a Review</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">Rating</label>
              <select
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                className="select-dark"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'star' : 'stars'}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">Comment</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="input-dark"
                rows="4"
                placeholder="Share your experience with this class..."
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium tracking-wide shadow-lg shadow-blue-500/30 transition-all"
            >
              Submit Review
            </button>
          </form>
        )}

        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20">
              <div className="flex items-center mb-4">
                <img
                  src={review.user?.profilePicture || 'https://via.placeholder.com/50'}
                  alt={review.user?.name || 'User'}
                  className="w-10 h-10 rounded-full border border-white/20 mr-4"
                />
                <div>
                  <h4 className="font-semibold text-white tracking-wide">{review.user?.name || 'Anonymous'}</h4>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-300">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

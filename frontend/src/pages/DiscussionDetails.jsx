import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiClock, FiUser, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeProvider';

export default function DiscussionDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchDiscussion = async () => {
      try {
        const response = await api.get(`/discussions/${id}`);
        setDiscussion(response.data);

        // Check if the user is enrolled in the class
        const enrollmentResponse = await api.get(`/classes/${response.data.classId._id}/enrollment`);
        // Ensure the response has the expected property (you might need to adjust based on the actual API response)
        setIsEnrolled(enrollmentResponse.data.isEnrolled);
      } catch (error) {
        console.error('Error fetching discussion:', error);
        toast.error('Failed to load discussion');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussion();
  }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/discussions/${id}/replies`, {
        content: replyContent
      });
      
      // Update the discussion with the new reply
      setDiscussion(response.data);
      setReplyContent('');
      toast.success('Reply posted successfully');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error(error.response?.data?.message || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const FlaggedContentWarning = ({ moderation }) => {
    if (!moderation?.flagged) return null;

    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center text-red-400">
          <FiAlertTriangle className="h-5 w-5 mr-2" />
          <span className="font-medium">Flagged Content</span>
        </div>
        {moderation.reason && (
          <p className="mt-2 text-sm text-red-300">{moderation.reason}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Discussion not found</h2>
          <Link to="/discussions" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to Discussions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to={`/classes/${discussion.classId._id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
        >
          <FiArrowLeft className="h-5 w-5 mr-2" />
          Back to Class
        </Link>

        {/* Discussion Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl shadow-sm p-8 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        >
          {discussion.moderation?.flagged && (
            <FlaggedContentWarning moderation={discussion.moderation} />
          )}
          <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{discussion.title}</h1>
          <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{discussion.content}</p>
          <div className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex items-center">
              <FiUser className="h-4 w-4 mr-2" />
              <span>{discussion.author.name}</span>
            </div>
            <div className="flex items-center">
              <FiClock className="h-4 w-4 mr-2" />
              <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Replies Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-xl shadow-sm p-8 mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Replies ({discussion.replies?.length || 0})
          </h2>
          <div className="space-y-6">
            {discussion.replies?.map((reply) => (
              <div key={reply._id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} pb-6 last:border-0`}>
                {reply.moderation?.flagged && (
                  <FlaggedContentWarning moderation={reply.moderation} />
                )}
                <div className="flex items-start space-x-4">
                  <img
                    src={reply.author.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author.name)}&background=random`}
                    alt={reply.author.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{reply.author.name}</h3>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{reply.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reply Form (Only visible if the user is enrolled) */}
        {currentUser && isEnrolled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-xl shadow-sm p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Post a Reply</h2>
            <form onSubmit={handleReply}>
              <div className="mb-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  rows="4"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                className={`px-6 py-3 rounded-lg text-white font-semibold ${
                  submitting || !replyContent.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {submitting ? 'Posting...' : 'Post Reply'}
              </button>
            </form>
          </motion.div>
        )}
        
        {/* If user is not enrolled */}
        {!isEnrolled && currentUser && (
          <div className="text-center mt-8">
            <p className="text-gray-500">You must be enrolled in the class to post a reply.</p>
          </div>
        )}
      </div>
    </div>
  );
}

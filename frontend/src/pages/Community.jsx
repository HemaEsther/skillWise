import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiMessageSquare,
  FiUser,
  FiClock,
  FiHeart,
  FiTag,
  FiPlus,
  FiTrash2,
  FiSend
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const SentimentBadge = ({ sentiment }) => {
  const getBadgeColor = (label, polarity) => {
    if (label === 'POSITIVE') return 'bg-green-500/20 text-green-400';
    if (label === 'NEGATIVE') return 'bg-red-500/20 text-red-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  const getEmojiForSentiment = (label) => {
    if (label === 'POSITIVE') return '😊';
    if (label === 'NEGATIVE') return '😔';
    return '😐';
  };

  return (
    <span className={`px-2 py-1 rounded ${getBadgeColor(sentiment.label, sentiment.polarity)}`}>
      {getEmojiForSentiment(sentiment.label)} {sentiment.label.toLowerCase()}
    </span>
  );
};

export default function Community() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });
  const [replyContent, setReplyContent] = useState({});
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/community${category !== 'all' ? `?category=${category}` : ''}`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const postData = {
        ...newPost,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      const response = await api.post('/community', postData);
      setPosts([response.data, ...posts]);
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', category: 'general', tags: '' });
      toast.success('Post created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await api.post(`/community/${postId}/like`);
      setPosts(posts.map(post => 
        post._id === postId ? response.data : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/community/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleReply = async (postId) => {
    if (!replyContent[postId]?.trim()) return;

    setSubmitting(prev => ({ ...prev, [postId]: true }));
    try {
      const response = await api.post(`/community/${postId}/replies`, {
        content: replyContent[postId]
      });
      
      setPosts(posts.map(post => 
        post._id === postId ? response.data : post
      ));
      setReplyContent(prev => ({ ...prev, [postId]: '' }));
      toast.success('Reply posted successfully');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error(error.response?.data?.message || 'Failed to post reply');
    } finally {
      setSubmitting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-wide">Community</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium tracking-wide shadow-lg shadow-blue-500/30 transition-all"
          >
            <FiPlus className="mr-2 h-5 w-5" />
            Create Post
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-dark pl-10"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select-dark pl-10"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="question">Questions</option>
              <option value="announcement">Announcements</option>
              <option value="help">Help</option>
            </select>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div
              key={post._id}
              className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all shadow-lg shadow-blue-500/20"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2 tracking-wide">{post.title}</h3>
                  <p className="text-gray-300 mb-4">{post.content}</p>
                  <div className="mb-2">
                    <SentimentBadge sentiment={post.sentiment} />
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                    {post.replies?.length || 0} replies
                  </span>
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                    {post.likes?.length || 0} likes
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center">
                  <img
                    src={post.author.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`}
                    alt={post.author.name}
                    className="w-6 h-6 rounded-full border border-white/20 mr-2"
                  />
                  <span>{post.author.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <FiTag className="mr-1 h-4 w-4" />
                    <span>{post.category}</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-1 h-4 w-4" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <button
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center space-x-1 ${
                    post.likes?.some(like => like._id === currentUser._id)
                      ? 'text-red-400'
                      : 'text-gray-400 hover:text-red-400'
                  }`}
                >
                  <FiHeart className="h-5 w-5" />
                  <span>Like</span>
                </button>
                {(post.author._id === currentUser._id || currentUser?.role === 'admin') && (
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-red-400"
                  >
                    <FiTrash2 className="h-5 w-5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>

              {/* Replies Section */}
              <div className="mt-6 space-y-4">
                {post.replies?.map((reply) => (
                  <div key={reply._id} className="pl-6 border-l-2 border-white/10">
                    <div className="flex items-start space-x-3">
                      <img
                        src={reply.author.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author.name)}&background=random`}
                        alt={reply.author.name}
                        className="w-6 h-6 rounded-full border border-white/20"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{reply.author.name}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{reply.content}</p>
                        <div className="mt-1">
                          <SentimentBadge sentiment={reply.sentiment} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Reply Form */}
                {currentUser && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={replyContent[post._id] || ''}
                        onChange={(e) => setReplyContent(prev => ({ ...prev, [post._id]: e.target.value }))}
                        placeholder="Write a reply..."
                        className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleReply(post._id)}
                        disabled={submitting[post._id] || !replyContent[post._id]?.trim()}
                        className={`px-4 py-2 rounded-lg ${
                          submitting[post._id] || !replyContent[post._id]?.trim()
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white transition-colors`}
                      >
                        <FiSend className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <FiMessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white tracking-wide">No posts found</h3>
            <p className="text-gray-300">
              {searchTerm ? 'Try adjusting your search' : 'Be the first to create a post!'}
            </p>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Create New Post</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="input-dark"
                  placeholder="Enter post title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="input-dark"
                  rows="4"
                  placeholder="Enter post content"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="select-dark"
                >
                  <option value="general">General</option>
                  <option value="question">Question</option>
                  <option value="announcement">Announcement</option>
                  <option value="help">Help</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., javascript, react, node"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 
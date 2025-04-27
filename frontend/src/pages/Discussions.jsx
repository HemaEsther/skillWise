import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { FiSearch, FiFilter, FiMessageSquare, FiUser, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Discussions() {
  const { currentUser } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, my-posts, my-replies
  const [expandedClasses, setExpandedClasses] = useState({});

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/discussions');
        setDiscussions(response.data || []);
        // Initialize expanded state for each class
        const initialExpanded = {};
        response.data.forEach(discussion => {
          if (discussion.classId) {
            initialExpanded[discussion.classId._id] = true;
          }
        });
        setExpandedClasses(initialExpanded);
      } catch (error) {
        console.error('Error fetching discussions:', error);
        if (error.response?.status === 401) {
          toast.error('Please log in to view discussions');
        } else if (error.response?.status === 403) {
          toast.error('You are not enrolled in any classes');
        } else {
          toast.error(error.response?.data?.message || 'Failed to load discussions');
        }
        setDiscussions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, []);

  const toggleClassExpansion = (classId) => {
    setExpandedClasses(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));
  };

  // Group discussions by class
  const groupedDiscussions = discussions.reduce((acc, discussion) => {
    if (!discussion.classId) return acc;
    
    const classId = discussion.classId._id;
    if (!acc[classId]) {
      acc[classId] = {
        classInfo: discussion.classId,
        discussions: []
      };
    }
    acc[classId].discussions.push(discussion);
    return acc;
  }, {});

  // Filter discussions based on search term and filter
  const filteredGroupedDiscussions = Object.entries(groupedDiscussions).reduce((acc, [classId, classData]) => {
    const filteredDiscussions = classData.discussions.filter(discussion => {
      const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === 'all') return matchesSearch;
      if (filter === 'my-posts') return matchesSearch && discussion.author._id === currentUser._id;
      if (filter === 'my-replies') {
        return matchesSearch && discussion.replies.some(reply => reply.author._id === currentUser._id);
      }
      
      return matchesSearch;
    });

    if (filteredDiscussions.length > 0) {
      acc[classId] = {
        ...classData,
        discussions: filteredDiscussions
      };
    }
    return acc;
  }, {});

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
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-wide">Discussions</h1>
          <Link
            to="/discussions/create"
            className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium tracking-wide shadow-lg shadow-blue-500/30 transition-all"
          >
            <FiMessageSquare className="mr-2 h-5 w-5" />
            Start Discussion
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search discussions..."
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
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="select-dark pl-10"
            >
              <option value="all">All Discussions</option>
              <option value="my-posts">My Posts</option>
              <option value="my-replies">My Replies</option>
            </select>
          </div>
        </div>

        {/* Grouped Discussions List */}
        <div className="space-y-6">
          {Object.entries(filteredGroupedDiscussions).map(([classId, classData]) => (
            <div key={classId} className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20">
              {/* Class Header */}
              <button
                onClick={() => toggleClassExpansion(classId)}
                className="w-full p-6 flex justify-between items-center hover:bg-white/5 transition-all"
              >
                <h2 className="text-2xl font-bold text-white">{classData.classInfo.title}</h2>
                {expandedClasses[classId] ? (
                  <FiChevronUp className="h-6 w-6 text-gray-400" />
                ) : (
                  <FiChevronDown className="h-6 w-6 text-gray-400" />
                )}
              </button>

              {/* Class Discussions */}
              {expandedClasses[classId] && (
                <div className="p-6 pt-0 space-y-4">
                  {classData.discussions.map(discussion => (
                    <Link
                      key={discussion._id}
                      to={`/discussions/${discussion._id}`}
                      className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">{discussion.title}</h3>
                          <p className="text-gray-300 mb-4 line-clamp-2">{discussion.content}</p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            {discussion.replies?.length || 0} replies
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center">
                          <img
                            src={discussion.author.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(discussion.author.name)}&background=random`}
                            alt={discussion.author.name}
                            className="w-6 h-6 rounded-full border border-white/20 mr-2"
                          />
                          <span>{discussion.author.name}</span>
                        </div>
                        <div className="flex items-center">
                          <FiClock className="mr-1 h-4 w-4" />
                          <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {Object.keys(filteredGroupedDiscussions).length === 0 && (
          <div className="text-center py-12">
            <FiMessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white tracking-wide">No discussions found</h3>
            <p className="text-gray-300">
              {searchTerm ? 'Try adjusting your search' : 'Be the first to start a discussion!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
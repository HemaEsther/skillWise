import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { FiBook, FiUsers, FiMessageSquare, FiPlus, FiCalendar, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import GeminiChat from '../components/GeminiChat/GeminiChat';

export default function FuturisticDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    enrolledClasses: 0,
    createdClasses: 0,
    discussions: 0,
    upcomingClasses: 0,
    completedClasses: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('unverified'); // 'unverified', 'pending', 'verified'

  // Function to check verification status
  const checkVerificationStatus = async () => {
    try {
      const response = await api.get('/auth/profile');
      const updatedUser = response.data;
      
      if (updatedUser.verified) {
        setVerificationStatus('verified');
      } else if (updatedUser.verificationRequested) {
        setVerificationStatus('pending');
      } else {
        setVerificationStatus('unverified');
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      toast.error('User not authenticated');
      setLoading(false);
      return;
    }
  
    const fetchDashboardData = async () => {
      try {
        const [classesRes, discussionsRes, userRes] = await Promise.all([
          api.get('/classes'),
          api.get('/discussions'),
          api.get('/auth/profile')
        ]);
  
        const classes = classesRes.data.classes || [];
        const discussions = discussionsRes.data || [];
        const updatedUser = userRes.data;
  
        // Update verification status based on user data
        if (updatedUser.verified) {
          setVerificationStatus('verified');
        } else if (updatedUser.verificationRequested) {
          setVerificationStatus('pending');
        } else {
          setVerificationStatus('unverified');
        }
  
        const enrolledClasses = classes.filter(c => c.enrolledStudents?.includes(currentUser?._id));
        const createdClasses = classes.filter(c => c.mentor?._id === currentUser?._id);
        const userDiscussions = discussions.filter(d => d.author?._id === currentUser?._id);
  
        // Combine and sort recent activity
        const activity = [
          ...enrolledClasses.map(c => ({ type: 'enrollment', data: c, date: c.createdAt })),
          ...userDiscussions.map(d => ({ type: 'discussion', data: d, date: d.createdAt }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  
        setStats({
          enrolledClasses: enrolledClasses.length,
          createdClasses: createdClasses.length,
          discussions: userDiscussions.length,
          upcomingClasses: enrolledClasses.filter(c => new Date(c.startDate) > new Date()).length,
          completedClasses: enrolledClasses.filter(c => c.status === 'completed').length
        });
        setRecentActivity(activity);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchDashboardData();

    // Set up periodic verification status check
    const verificationInterval = setInterval(checkVerificationStatus, 10000); // Check every 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(verificationInterval);
  }, [currentUser]);

  const handleVerificationRequest = async () => {
    try {
      const response = await api.post('/users/request-verification');
      if (response.status === 200) {
        toast.success('Verification request sent to admin!');
        setVerificationStatus('pending');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error requesting verification:', error);
      toast.error(error.response?.data?.message || 'Failed to send verification request');
    }
  };

  const openVerificationModal = () => {
    setIsModalOpen(true);
  };

  const closeVerificationModal = () => {
    setIsModalOpen(false);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Welcome {currentUser.role === 'mentor' ? 'Mentor' : 'Learner'}, {currentUser.name}!
              </h1>
              <p className="mt-2 text-lg text-gray-300 tracking-wide">
                Here's what's happening with your learning journey
              </p>
            </div>
            {currentUser.role === 'mentor' && (
              <div className="flex items-center">
                {verificationStatus === 'verified' ? (
                  <div className="flex items-center px-4 py-2 rounded-lg bg-green-500/20 text-green-400">
                    <FiAward className="h-5 w-5 mr-2" />
                    <span>Verified Mentor</span>
                  </div>
                ) : verificationStatus === 'pending' ? (
                  <div className="flex items-center px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                    <FiAward className="h-5 w-5 mr-2" />
                    <span>Verification Pending</span>
                  </div>
                ) : (
                  <button
                    onClick={openVerificationModal}
                    className="flex items-center px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  >
                    <FiAward className="h-5 w-5 mr-2" />
                    <span>Request Verification</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                <FiBook className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300 tracking-wide">Enrolled Classes</p>
                <p className="text-2xl font-semibold text-white">{stats.enrolledClasses}</p>
              </div>
            </div>
          </motion.div>

          {currentUser.role === 'mentor' && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-teal-500">
                  <FiUsers className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300 tracking-wide">Created Classes</p>
                  <p className="text-2xl font-semibold text-white">{stats.createdClasses}</p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <FiMessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300 tracking-wide">Discussions</p>
                <p className="text-2xl font-semibold text-white">{stats.discussions}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500">
                <FiAward className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300 tracking-wide">Completed Classes</p>
                <p className="text-2xl font-semibold text-white">{stats.completedClasses}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4 tracking-wide">Quick Actions</h2>
            <div className="space-y-4">
              <Link
                to="/classes"
                className="flex items-center p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all shadow-md"
              >
                <FiBook className="h-5 w-5 mr-3" />
                Browse Classes
              </Link>
              <Link
                to="/discussions"
                className="flex items-center p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all shadow-md"
              >
                <FiMessageSquare className="h-5 w-5 mr-3" />
                View Discussions
              </Link>
              {currentUser.role === 'mentor' && (
                <Link
                  to="/classes/create"
                  className="flex items-center p-3 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white transition-all shadow-md"
                >
                  <FiPlus className="h-5 w-5 mr-3" />
                  Create New Class
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4 tracking-wide">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full bg-gradient-to-br ${
                    activity.type === 'enrollment' 
                      ? 'from-blue-500 to-purple-500' 
                      : 'from-purple-500 to-pink-500'
                  }`}>
                    <FiCalendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300">{activity.type === 'enrollment' ? 'Enrolled in' : 'Participated in'} a class</p>
                    <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Verification Request Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Request Verification</h2>
              <p className="text-gray-300 mb-6">
                By requesting verification, you'll be able to create and manage classes. 
                Our admin team will review your request and get back to you soon.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeVerificationModal}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerificationRequest}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Request Verification
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <GeminiChat />
    </div>
  );
}

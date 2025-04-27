import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiBook, FiEdit, FiMessageSquare, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import toast from 'react-hot-toast';

export default function FuturisticProfile() {
  const { currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    profilePicture: currentUser?.profilePicture || '',
    bio: currentUser?.bio || ''
  });
  const [loading, setLoading] = useState(false);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [createdClasses, setCreatedClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Fetch enrolled classes
        const enrolledResponse = await api.get('/classes/enrolled');
        setEnrolledClasses(enrolledResponse.data);

        // Fetch created classes if user is a mentor
        if (currentUser?.role === 'mentor') {
          const createdResponse = await api.get('/classes/created');
          setCreatedClasses(createdResponse.data);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      } finally {
        setLoadingClasses(false);
      }
    };

    if (currentUser) {
      fetchClasses();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 to-transparent"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 to-transparent"></div>
      <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl animate-float"></div>
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 blur-3xl animate-float-slow"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Profile Section */}
        <div className="rounded-xl p-8 mb-8 bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-wide">Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium tracking-wide shadow-lg shadow-blue-500/30 transition-all flex items-center"
            >
              <FiEdit className="mr-2 h-5 w-5" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <img
                src={currentUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`}
                alt={currentUser.name}
                className="w-32 h-32 rounded-full border border-white/20 object-cover"
              />
            </div>

            {/* Profile Information */}
            <div className="flex-grow">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">
                      Profile Picture URL
                    </label>
                    <input
                      type="url"
                      id="profilePicture"
                      name="profilePicture"
                      value={formData.profilePicture}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px]"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-semibold bg-gradient-to-r ${
                      loading
                        ? 'from-gray-500 to-gray-600 opacity-75 cursor-not-allowed'
                        : 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    } shadow-lg shadow-blue-500/30 transition-all`}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 tracking-wide">Name</h3>
                    <p className="text-lg text-white">{currentUser.name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-300 tracking-wide">Email</h3>
                    <p className="text-lg text-white">{currentUser.email}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-300 tracking-wide">Role</h3>
                    <p className="text-lg capitalize text-white">{currentUser.role}</p>
                  </div>

                  {currentUser.bio && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 tracking-wide">Bio</h3>
                      <p className="text-lg text-white">{currentUser.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                <FiBook className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300 tracking-wide">Classes</p>
                <p className="text-2xl font-semibold text-white">
                  {currentUser.role === 'mentor' ? createdClasses.length : enrolledClasses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500/20 text-green-400">
                <FiMessageSquare className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300 tracking-wide">Discussions</p>
                <p className="text-2xl font-semibold text-white">Started</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
                <FiUser className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300 tracking-wide">Member Since</p>
                <p className="text-2xl font-semibold text-white">
                  {new Date(currentUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Section */}
        {currentUser.role === 'mentor' ? (
          <div className="rounded-xl p-8 mb-8 bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-6 tracking-wide">Created Classes</h2>
            {loadingClasses ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            ) : createdClasses.length > 0 ? (
              <div className="space-y-4">
                {createdClasses.map(classItem => (
                  <Link
                    key={classItem._id}
                    to={`/classes/${classItem._id}`}
                    className="block p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-white tracking-wide">{classItem.title}</h3>
                        <p className="text-sm text-gray-300 mt-1">{classItem.description}</p>
                      </div>
                      <FiArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-300">You haven't created any classes yet.</p>
            )}
          </div>
        ) : (
          <div className="rounded-xl p-8 mb-8 bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-6 tracking-wide">Enrolled Classes</h2>
            {loadingClasses ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              </div>
            ) : enrolledClasses.length > 0 ? (
              <div className="space-y-4">
                {enrolledClasses.map(classItem => (
                  <Link
                    key={classItem._id}
                    to={`/classes/${classItem._id}`}
                    className="block p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-white tracking-wide">{classItem.title}</h3>
                        <p className="text-sm text-gray-300 mt-1">{classItem.description}</p>
                      </div>
                      <FiArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-300">You haven't enrolled in any classes yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CreateDiscussion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    classId: searchParams.get('classId') || ''
  });

  // Fetch available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Get enrolled classes
        const response = await api.get('/classes/enrolled');
        setClasses(response.data || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      }
    };

    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.classId) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/discussions', formData);
      toast.success('Discussion created successfully');
      navigate(`/classes/${formData.classId}`);
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast.error(error.response?.data?.message || 'Failed to create discussion');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 to-transparent"></div>
      <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl animate-float"></div>
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 blur-3xl animate-float-slow"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8 font-medium tracking-wide"
        >
          <FiArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="rounded-xl p-8 bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-8 tracking-wide">
            Create New Discussion
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-300 mb-2 tracking-wide"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter discussion title"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-300 mb-2 tracking-wide"
              >
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="6"
                className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter discussion content"
              />
            </div>

            <div>
              <label
                htmlFor="classId"
                className="block text-sm font-medium text-gray-300 mb-2 tracking-wide"
              >
                Select Class
              </label>
              <select
                id="classId"
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!!searchParams.get('classId')}
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.title}
                  </option>
                ))}
              </select>
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
              {loading ? 'Creating...' : 'Create Discussion'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
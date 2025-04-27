import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';

export default function CreateClass() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    contentType: 'live',
    contentUrl: '',
    price: 0,
    isPaid: false,
    schedule: '',
    maxStudents: '',
    prerequisites: '',
    materials: '',
    tags: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert tags string to array if needed
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        mentor: currentUser._id
      };

      const response = await api.post('/classes', submitData);
      toast.success('Class created successfully!');
      navigate(`/classes/${response.data._id}`);
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error(error.response?.data?.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== 'mentor') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/20 to-transparent"></div>
        <div className="text-center relative z-10">
          <h1 className="text-2xl font-bold text-white mb-4 tracking-wide">Access Denied</h1>
          <p className="text-gray-300">Only mentors can create classes.</p>
        </div>
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-blue-500/20">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-8 tracking-wide">
            Create New Class
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1 tracking-wide">
                Class Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="block w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1 tracking-wide">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="block w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px]"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1 tracking-wide">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              >
                <option value="">Select a category</option>
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="business">Business</option>
                <option value="personal development">Personal Development</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="contentType" className="block text-sm font-medium text-gray-300 mb-1 tracking-wide">
                Content Type *
              </label>
              <select
                id="contentType"
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
                className="block w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              >
                <option value="live">Live Sessions</option>
                <option value="video">Pre-recorded Video</option>
                <option value="uploadable">Uploadable Content</option>
              </select>
            </div>

            {formData.contentType !== 'live' && (
              <div>
                <label htmlFor="contentUrl" className="block text-sm font-medium text-gray-300 mb-1 tracking-wide">
                  Content URL *
                </label>
                <input
                  type="url"
                  id="contentUrl"
                  name="contentUrl"
                  value={formData.contentUrl}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                  placeholder="https://example.com/content"
                />
              </div>
            )}

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1 tracking-wide">
                Price
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="block w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPaid"
                name="isPaid"
                checked={formData.isPaid}
                onChange={handleChange}
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded bg-white/10"
              />
              <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-300 tracking-wide">
                This is a paid class
              </label>
            </div>

            <div>
              <label htmlFor="schedule" className="block text-sm font-medium text-gray-300 mb-1 tracking-wide">
                Schedule
              </label>
              <input
                type="text"
                id="schedule"
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                className="block w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g., Every Monday and Wednesday, 6-8 PM"
              />
            </div>

            <div>
              <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-300 mb-1 tracking-wide">
                Maximum Students
              </label>
              <input
                type="number"
                id="maxStudents"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleChange}
                className="block w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                min="1"
              />
            </div>

            <div>
              <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-300 mb-1 tracking-wide">
                Prerequisites
              </label>
              <textarea
                id="prerequisites"
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleChange}
                className="block w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px]"
                placeholder="List any prerequisites or recommended knowledge"
              />
            </div>

            <div>
              <label htmlFor="materials" className="block text-sm font-medium text-gray-300 mb-1 tracking-wide">
                Required Materials
              </label>
              <textarea
                id="materials"
                name="materials"
                value={formData.materials}
                onChange={handleChange}
                className="block w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px]"
                placeholder="List any required materials or resources"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1 tracking-wide">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="block w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/classes')}
                className="px-6 py-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 text-white font-medium tracking-wide transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium tracking-wide shadow-lg shadow-blue-500/30 transition-all ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating...' : 'Create Class'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
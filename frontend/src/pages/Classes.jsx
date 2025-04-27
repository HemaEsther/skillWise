import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { FiSearch, FiFilter, FiBook, FiUsers, FiClock, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function FuturisticClasses() {
  const { currentUser } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, enrolled, created

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/classes');
        setClasses(response.data.classes || []);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'enrolled') return matchesSearch && cls.enrolledStudents?.includes(currentUser._id);
    if (filter === 'created') return matchesSearch && cls.mentor._id === currentUser._id;
    
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
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-wide">
            Classes
          </h1>
          {currentUser?.role === 'mentor' && (
            <Link
              to="/classes/create"
              className="flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium tracking-wide shadow-lg shadow-green-500/30 transition-all"
            >
              <FiBook className="mr-2 h-5 w-5" />
              Create Class
            </Link>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search classes..."
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
              <option value="all">All Classes</option>
              <option value="enrolled">Enrolled Classes</option>
              {currentUser?.role === 'mentor' && (
                <option value="created">Created Classes</option>
              )}
            </select>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map(cls => (
            <Link
              key={cls._id}
              to={`/classes/${cls._id}`}
              className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all shadow-lg shadow-blue-500/20"
            >
              <h3 className="text-xl font-semibold text-white mb-2 tracking-wide">{cls.title}</h3>
              <p className="text-gray-300 mb-4 line-clamp-2">{cls.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center">
                  <FiUsers className="mr-1 h-4 w-4" />
                  <span>{cls.enrolledStudents?.length || 0} students</span>
                </div>
                <div className="flex items-center">
                  <FiClock className="mr-1 h-4 w-4" />
                  <span>{new Date(cls.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Display the average rating */}
              <div className="mt-4 text-sm text-gray-400">
                <FiStar className="inline-block mr-1 text-yellow-400" />
                <span>{cls.rating ? cls.rating.toFixed(1) : 'No ratings yet'}</span>
              </div>
            </Link>
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <FiBook className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white tracking-wide">No classes found</h3>
            <p className="text-gray-300">
              {searchTerm ? 'Try adjusting your search' : 'Be the first to create a class!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

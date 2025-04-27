import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a token in localStorage first
        const token = localStorage.getItem('token');
        if (!token) {
          setCurrentUser(null);
          setLoading(false);
          setInitialized(true);
          return;
        }

        const response = await api.get('/auth/profile');
        if (response.data) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        // Only log non-401 errors since 401 is expected when not logged in
        if (error.response?.status !== 401) {
          console.error('Auth check error:', error);
        }
        setCurrentUser(null);
        localStorage.removeItem('token'); // Clear token on auth failure
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    if (!initialized) {
      checkAuth();
    }
  }, [initialized]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Starting login process for:', email);
      
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      console.log('Login API response:', response.data);
      
      if (response.data) {
        console.log('Setting current user:', response.data);
        setCurrentUser(response.data);
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        toast.success('Login successful!');
        
        // Role-based redirection
        if (response.data.role === 'admin') {
          console.log('Redirecting to admin dashboard');
          navigate('/admin');
        } else {
          console.log('Redirecting to user dashboard');
          navigate('/dashboard');
        }
        return response.data;
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      
      if (response.data) {
        setCurrentUser(response.data);
        toast.success('Registration successful! Welcome to our platform!');
        
        // Role-based redirection
        if (response.data.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setCurrentUser(null);
      localStorage.removeItem('token'); // Clear token on logout
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const response = await api.put('/auth/profile', userData);
      setCurrentUser(response.data);
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    isMentor: currentUser?.role === 'mentor' || currentUser?.role === 'both',
  };

  return (
    <AuthContext.Provider value={value}>
      <div className="min-h-screen">
        {loading && (
          <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {children}
      </div>
    </AuthContext.Provider>
  );
} 
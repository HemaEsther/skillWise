import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MentorRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (currentUser.role !== 'mentor') {
    return <Navigate to="/classes" />;
  }

  return children;
} 
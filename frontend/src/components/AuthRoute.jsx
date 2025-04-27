import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser ? children : <Navigate to="/login" />;
} 
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LearnerRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser?.role === 'learner' ? children : <Navigate to="/" />;
} 
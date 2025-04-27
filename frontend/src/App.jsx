import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeProvider';
import PrivateRoute from './components/PrivateRoute';
import MentorRoute from './components/MentorRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/layout/Layout';
import { useEffect } from 'react';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import CreateClass from './pages/CreateClass';
import ClassDetails from './pages/ClassDetails';
import Discussions from './pages/Discussions';
import DiscussionDetails from './pages/DiscussionDetails';
import CreateDiscussion from './pages/CreateDiscussion';
import Reviews from './pages/Reviews';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';
import Community from './pages/Community';

function App() {
  useEffect(() => {
    document.title = 'SkillSphere - Learn • Grow • Excel';
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="classes" element={<PrivateRoute><Classes /></PrivateRoute>} />
              <Route path="classes/create" element={<MentorRoute><CreateClass /></MentorRoute>} />
              <Route path="classes/:id" element={<PrivateRoute><ClassDetails /></PrivateRoute>} />
              <Route path="classes/:classId/reviews" element={<Reviews />} />
              <Route path="discussions" element={<PrivateRoute><Discussions /></PrivateRoute>} />
              <Route path="discussions/create" element={<PrivateRoute><CreateDiscussion /></PrivateRoute>} />
              <Route path="discussions/:id" element={<PrivateRoute><DiscussionDetails /></PrivateRoute>} />
              <Route path="community" element={<PrivateRoute><Community /></PrivateRoute>} />
              <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

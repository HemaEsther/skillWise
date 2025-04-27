import jwt from 'jsonwebtoken';
import User from '../models/usersModel.js';

export const protect = async (req, res, next) => {
  let token;
  
  // Check for token in cookies
  if (req.cookies.token) {
    try {
      // Get token from cookie
      token = req.cookies.token;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const isMentor = async (req, res, next) => {
  if (req.user && (req.user.role === 'mentor' || req.user.role === 'both')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized. Only mentors can perform this action.' });
  }
};

export const admin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized. Only admins can perform this action.' });
  }
};

export const isVerified = async (req, res, next) => {
  // Check if the user is a mentor
  if (req.user.role === 'mentor' || req.user.role === 'both') {
    try {
      // Log the user role and verification status for debugging
      console.log('User Role:', req.user.role);
      
      // Find the user by their ID
      const user = await User.findById(req.user.id);

      // Log the user object to check the isVerifiedMentor field
      console.log('User:', user);

      // Check if the user is a verified mentor
      if (user && user.isVerifiedMentor) {
        console.log('Mentor is verified, proceeding...');
        next();
      } else {
        console.log('Mentor is not verified.');
        res.status(403).json({ message: 'Not authorized. Mentor is not verified.' });
      }
    } catch (error) {
      console.error('Error finding user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    console.log('User is not a mentor or both.');
    res.status(403).json({ message: 'Not authorized. Only mentors can perform this action.' });
  }
};


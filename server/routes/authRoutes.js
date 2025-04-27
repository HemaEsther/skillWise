import express from 'express';
import { registerUser, loginUser, getUserProfile, logoutUser, updateProfile, getAllUsers } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes

router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (only for logged-in users)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateProfile);
router.post('/logout', protect, logoutUser);

router.get('/users',getAllUsers)

export default router;

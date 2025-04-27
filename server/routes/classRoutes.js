import express from 'express';
import { createClass, getClasses, getClassById, updateClass, deleteClass, enrollInClass, getEnrolledClasses, getCreatedClasses, unenrollFromClass, rateClass, checkEnrollment, startLiveSession } from '../controllers/classController.js';
import { protect, isMentor, isVerified } from '../middleware/authMiddleware.js';

const router = express.Router();

// User-specific routes (protected) - These need to come before /:id routes
router.get('/enrolled', protect, getEnrolledClasses);
router.get('/created', protect, isMentor, getCreatedClasses);

// Public routes
router.get('/', getClasses); // Get all classes with optional filters
router.get('/:id', getClassById); // Get a class by ID

// Protected routes (only mentors can create/update/delete classes)
router.post('/', protect, isMentor, isVerified, createClass); // Create a new class
router.put('/:id', protect, isMentor, updateClass); // Update an existing class
router.delete('/:id', protect, isMentor, deleteClass); // Delete a class
router.route('/:id/rate').post(protect, rateClass);  // New route for rating a class

// Enrollment routes (protected, but available to all authenticated users)
router.post('/:id/enroll', protect, enrollInClass);
// Add this to your router
router.get('/:id/enrollment', protect, checkEnrollment);

router.post('/:id/unenroll', protect, unenrollFromClass);

// Define the route for starting the live session
router.post('/:id/start-live-session', startLiveSession);




export default router;

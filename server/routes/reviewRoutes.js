import express from 'express';
import { createReview, getReviewsForClass, getAverageRatingForClass } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a review (Private)
router.post('/', protect, createReview);

// Get all reviews for a class (Public)
router.get('/:classId', getReviewsForClass);

// Get average rating for a class (Public)
router.get('/:classId/average', getAverageRatingForClass);

export default router;

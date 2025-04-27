import express from 'express';

import {
  getFlaggedDiscussions,
  deleteFlaggedDiscussion,
  getFlaggedReviews,
  deleteFlaggedReview,
  verifyMentor,
  reviewFlaggedContent,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Discussions
router.get('/flagged-discussions', protect, admin, getFlaggedDiscussions);
router.delete('/flagged-discussions/:id', protect, admin, deleteFlaggedDiscussion);

// Reviews
router.get('/flagged-reviews', protect, admin, getFlaggedReviews);
router.delete('/flagged-reviews/:id', protect, admin, deleteFlaggedReview);

// Verify Mentor
router.put('/verify-mentor/:id', protect, admin, verifyMentor);

router.post('/review-content/:id', protect, admin, reviewFlaggedContent);

export default router;

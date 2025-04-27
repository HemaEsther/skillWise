import express from 'express';
import { createDiscussionPost, getDiscussionPosts, getDiscussionPostById, addReplyToPost, startDiscussion, getAllDiscussions, deleteDiscussion } from '../controllers/discussionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all discussions (admin only)
router.get('/all', admin, getAllDiscussions);

// Create a new discussion post
router.post('/', createDiscussionPost);

// Get all discussion posts
router.get('/', getDiscussionPosts);

// Get a single discussion post by ID
router.get('/:id', getDiscussionPostById);

// Add a reply to a specific post
router.post('/:id/replies', addReplyToPost);

// Start a new discussion
router.post('/start', startDiscussion);

// Delete a discussion (admin or author only)
router.delete('/:id', deleteDiscussion);

export default router;

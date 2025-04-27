import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  addReply,
  toggleLike,
  deletePost
} from '../controllers/communityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create a new post
router.post('/', createPost);

// Get all posts
router.get('/', getPosts);

// Get a single post
router.get('/:id', getPostById);

// Add a reply to a post
router.post('/:id/replies', addReply);

// Like/Unlike a post
router.post('/:id/like', toggleLike);

// Delete a post
router.delete('/:id', deletePost);

export default router; 
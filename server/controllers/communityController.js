import asyncHandler from 'express-async-handler';
import CommunityPost from '../models/communityPostModel.js';
import sentimentAnalyzer from '../services/sentimentAnalysis.js';

// Create a new community post
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Please provide title and content');
  }

  // Analyze sentiment of the content
  const sentiment = await sentimentAnalyzer.analyzeSentiment(content);

  const post = await CommunityPost.create({
    title,
    content,
    category,
    tags,
    author: req.user._id,
    sentiment,
  });

  const populatedPost = await CommunityPost.findById(post._id)
    .populate('author', 'name profilePicture')
    .populate('replies.author', 'name profilePicture');

  res.status(201).json(populatedPost);
});

// Get all community posts
export const getPosts = asyncHandler(async (req, res) => {
  const { category, tag, search } = req.query;
  let filter = {};

  if (category) {
    filter.category = category;
  }

  if (tag) {
    filter.tags = tag;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  const posts = await CommunityPost.find(filter)
    .populate('author', 'name profilePicture')
    .populate('replies.author', 'name profilePicture')
    .sort({ createdAt: -1 });

  res.json(posts);
});

// Get a single post by ID
export const getPostById = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id)
    .populate('author', 'name profilePicture')
    .populate('replies.author', 'name profilePicture')
    .populate('likes', 'name profilePicture');

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  res.json(post);
});

// Add a reply to a post
export const addReply = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;

  if (!content) {
    res.status(400);
    throw new Error('Please provide content for the reply');
  }

  const post = await CommunityPost.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Analyze sentiment of the reply
  const sentiment = await sentimentAnalyzer.analyzeSentiment(content);

  post.replies.push({
    content,
    author: req.user._id,
    sentiment,
  });

  await post.save();

  const updatedPost = await CommunityPost.findById(postId)
    .populate('author', 'name profilePicture')
    .populate('replies.author', 'name profilePicture');

  res.status(201).json(updatedPost);
});

// Like/Unlike a post
export const toggleLike = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const likeIndex = post.likes.indexOf(req.user._id);
  if (likeIndex === -1) {
    post.likes.push(req.user._id);
  } else {
    post.likes.splice(likeIndex, 1);
  }

  await post.save();

  const updatedPost = await CommunityPost.findById(req.params.id)
    .populate('author', 'name profilePicture')
    .populate('replies.author', 'name profilePicture')
    .populate('likes', 'name profilePicture');

  res.json(updatedPost);
});

// Delete a post
export const deletePost = asyncHandler(async (req, res) => {
  const post = await CommunityPost.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Check if user is the author or an admin
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this post');
  }

  await post.deleteOne();
  res.json({ message: 'Post removed' });
}); 
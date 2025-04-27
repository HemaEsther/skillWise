import asyncHandler from 'express-async-handler';
import DiscussionPost from '../models/discussionPostModel.js';
import Class from '../models/classModel.js';
import mongoose from 'mongoose';
import sentimentAnalyzer from '../services/sentimentAnalysis.js';
import contentModerator from '../services/contentModeration.js';


export const createDiscussionPost = asyncHandler(async (req, res) => {
  const { title, content, classId } = req.body;


  if (!title || !content || !classId) {
    res.status(400);
    throw new Error('Please provide title, content, and classId');
  }

  const existingClass = await Class.findById(classId);
  if (!existingClass) {
    res.status(404);
    throw new Error('Class not found');
  }

  // Check if user is enrolled in the class
  const isEnrolled = existingClass.enrolledStudents.includes(req.user._id);
  const isMentor = existingClass.mentor.toString() === req.user._id.toString();

  if (!isEnrolled && !isMentor) {
    res.status(403);
    throw new Error('You must be enrolled in the class to participate in discussions');
  }

  // Analyze sentiment of the content
  const sentiment = await sentimentAnalyzer.analyzeSentiment(content);
  const moderation = await contentModerator.moderateContent(content, sentiment);

  const post = await DiscussionPost.create({
    title,
    content,
    author: req.user._id,
    classId,
    sentiment,
    moderation: {
      flagged: moderation.flagged,
      reason: moderation.reason,
      badWordsFound: moderation.badWordsFound
    }
  });

  // If content is flagged, notify admins
  if (moderation.flagged) {
    console.log(`Flagged content detected in post ${post._id}`);
  }

  res.status(201).json(post);
});


export const getDiscussionPosts = asyncHandler(async (req, res) => {
  try {
    const { classId } = req.query;

    // Get all classes the user is enrolled in or is a mentor of
    const userClasses = await Class.find({
      $or: [
        { enrolledStudents: req.user._id },
        { mentor: req.user._id }
      ]
    });

    // Get the IDs of these classes
    const userClassIds = userClasses.map(cls => cls._id);

    // If user has no enrolled classes, return empty array
    if (userClassIds.length === 0) {
      return res.json([]);
    }

    // Build the filter
    let filter = { classId: { $in: userClassIds } };
    if (classId) {
      // If a specific classId is provided, only show if user is enrolled
      const classIdObj = new mongoose.Types.ObjectId(classId);
      if (!userClassIds.some(id => id.toString() === classIdObj.toString())) {
        res.status(403);
        throw new Error('You are not enrolled in this class');
      }
      filter = { classId: classIdObj };
    }

    const posts = await DiscussionPost.find(filter)
      .populate('author', 'name profilePicture')
      .populate('classId', 'title')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Error in getDiscussionPosts:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch discussions' });
  }
});


export const getDiscussionPostById = asyncHandler(async (req, res) => {
  const post = await DiscussionPost.findById(req.params.id)
    .populate('author', 'name profilePicture')
    .populate('classId', 'title')
    .populate('replies.author', 'name profilePicture');

  if (!post) {
    res.status(404);
    throw new Error('Discussion post not found');
  }

  res.json(post);
});


export const addReplyToPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;

  if (!content) {
    res.status(400);
    throw new Error('Please provide content for the reply');
  }

  const post = await DiscussionPost.findById(postId).populate('classId');
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Check if user is enrolled in the class
  const isEnrolled = post.classId.enrolledStudents.includes(req.user._id);
  const isMentor = post.classId.mentor.toString() === req.user._id.toString();

  if (!isEnrolled && !isMentor) {
    res.status(403);
    throw new Error('You must be enrolled in the class to participate in discussions');
  }

  // Analyze sentiment and check content
  const sentiment = await sentimentAnalyzer.analyzeSentiment(content);
  const moderation = await contentModerator.moderateContent(content, sentiment);

  const reply = {
    content,
    author: req.user._id,
    sentiment,
    moderation: {
      flagged: moderation.flagged,
      reason: moderation.reason,
      badWordsFound: moderation.badWordsFound
    }
  };

  post.replies.push(reply);
  await post.save();

  // If content is flagged, notify admins
  if (moderation.flagged) {
    console.log(`Flagged content detected in reply to post ${postId}`);
  }

  const updatedPost = await DiscussionPost.findById(postId)
    .populate('author', 'name profilePicture')
    .populate('classId', 'title')
    .populate('replies.author', 'name profilePicture');

  res.status(201).json(updatedPost);
});

export const startDiscussion = asyncHandler(async (req, res) => {
  const { title, content, classId } = req.body;

  // Validate the required fields
  if (!title || !content || !classId) {
    res.status(400);
    throw new Error('Please provide title, content, and classId');
  }

  // Check if the class exists
  const existingClass = await Class.findById(classId);
  if (!existingClass) {
    res.status(404);
    throw new Error('Class not found');
  }

  // Check if the user is enrolled or a mentor of the class
  const isEnrolled = existingClass.enrolledStudents.includes(req.user._id);
  const isMentor = existingClass.mentor.toString() === req.user._id.toString();

  if (!isEnrolled && !isMentor) {
    res.status(403);
    throw new Error('You must be enrolled in the class or a mentor to start a discussion');
  }

  // Create a new discussion post
  const post = await DiscussionPost.create({
    title,
    content,
    author: req.user._id,
    classId,
  });

  res.status(201).json(post);
});

export const getAllDiscussions = asyncHandler(async (req, res) => {
  try {
    const posts = await DiscussionPost.find()
      .populate('author', 'name profilePicture')
      .populate('classId', 'title')
      .populate('replies.author', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json({ discussions: posts });
  } catch (error) {
    console.error('Error in getAllDiscussions:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch all discussions' });
  }
});

export const deleteDiscussion = asyncHandler(async (req, res) => {
  const discussion = await DiscussionPost.findById(req.params.id);
  
  if (!discussion) {
    res.status(404);
    throw new Error('Discussion not found');
  }

  // Check if user is admin or the author of the discussion
  if (req.user.role !== 'admin' && discussion.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this discussion');
  }

  await discussion.deleteOne();
  res.json({ message: 'Discussion removed' });
});


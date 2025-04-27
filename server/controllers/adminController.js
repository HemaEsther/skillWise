import asyncHandler from 'express-async-handler';
import Discussion from '../models/discussionPostModel.js';
import Review from '../models/reviewModel.js';
import User from '../models/usersModel.js';


export const getFlaggedDiscussions = asyncHandler(async (req, res) => {
  const discussions = await Discussion.find({ flagged: true });
  res.json(discussions);
});


export const deleteFlaggedDiscussion = asyncHandler(async (req, res) => {
  const discussion = await Discussion.findById(req.params.id);
  if (!discussion) {
    res.status(404);
    throw new Error('Discussion not found');
  }
  await discussion.deleteOne();
  res.json({ message: 'Flagged discussion deleted' });
});


export const getFlaggedReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ flagged: true });
  res.json(reviews);
});


export const deleteFlaggedReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  await review.deleteOne();
  res.json({ message: 'Flagged review deleted' });
});


export const verifyMentor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'mentor') {
    res.status(400);
    throw new Error('User is not a mentor');
  }

  user.verified = true;
  user.verificationRequested = false;
  await user.save();
  
  res.json({ message: 'Mentor verified successfully', user });
});


export const reviewFlaggedContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, reviewNotes } = req.body;
  
  // First try to find it in discussions
  let content = await Discussion.findById(id);
  let contentType = 'discussion';
  
  // If not found in discussions, check reviews
  if (!content) {
    content = await Review.findById(id);
    contentType = 'review';
  }

  if (!content) {
    res.status(404);
    throw new Error('Flagged content not found');
  }

  // Update the moderation fields
  content.moderation = {
    ...content.moderation,
    reviewedBy: req.user._id,
    reviewedAt: new Date(),
    reviewNotes: reviewNotes || '',
  };

  // If action is 'approve', unflag the content
  if (action === 'approve') {
    content.moderation.flagged = false;
  }

  await content.save();

  res.json({ 
    message: `${contentType} reviewed successfully`, 
    content 
  });
});

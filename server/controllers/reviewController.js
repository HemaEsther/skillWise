// import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Review from '../models/reviewModel.js';
import Class from '../models/classModel.js';


export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment, classId } = req.body;

  // Validate required fields
  if (!rating || !classId) {
    res.status(400);
    throw new Error('Please provide rating and classId');
  }

  // Validate rating range
  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  const existingClass = await Class.findById(classId);
  if (!existingClass) {
    res.status(404);
    throw new Error('Class not found');
  }

  // Prevent duplicate reviews
  const alreadyReviewed = await Review.findOne({ user: req.user._id, classId });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this class');
  }

  const review = await Review.create({
    rating,
    comment,
    user: req.user._id,
    classId,
  });

  res.status(201).json(review);
});


export const getReviewsForClass = asyncHandler(async (req, res) => {
  const classId = req.params.classId;

  // Validate classId
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    res.status(400);
    throw new Error('Invalid class ID');
  }

  const reviews = await Review.find({ classId })
    .populate('user', 'name profilePicture')
    .sort({ createdAt: -1 });

  res.json(reviews);
});


export const getAverageRatingForClass = asyncHandler(async (req, res) => {
  const classId = req.params.classId;

  // Validate classId
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    res.status(400);
    throw new Error('Invalid class ID');
  }

  const stats = await Review.aggregate([
    { $match: { classId: new mongoose.Types.ObjectId(classId) } },
    {
      $group: {
        _id: '$classId',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    res.json({
      averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: stats[0].count,
    });
  } else {
    res.json({
      averageRating: 0,
      totalReviews: 0,
    });
  }
});

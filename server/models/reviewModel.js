import mongoose, { Schema, model, Types } from 'mongoose';

const reviewSchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    classId: {
      type: Types.ObjectId,
      ref: 'Class',
      required: true,
    },
  },
  { timestamps: true }
);

const Review = model('Review', reviewSchema);

export default Review;

import mongoose, { Schema, model, Types } from 'mongoose';

const sentimentSchema = {
  polarity: {
    type: Number,
    default: 0,
  },
  label: {
    type: String,
    enum: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'],
    default: 'NEUTRAL',
  },
  confidence: {
    type: Number,
    default: 0,
  },
};

const communityPostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'question', 'announcement', 'help'],
      default: 'general'
    },
    tags: [{
      type: String
    }],
    likes: [{
      type: Types.ObjectId,
      ref: 'User'
    }],
    sentiment: sentimentSchema,
    replies: [
      {
        content: {
          type: String,
          required: true,
        },
        author: {
          type: Types.ObjectId,
          ref: 'User',
          required: true,
        },
        sentiment: sentimentSchema,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const CommunityPost = model('CommunityPost', communityPostSchema);

export default CommunityPost; 
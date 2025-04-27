import mongoose, { Schema, model, Types } from 'mongoose';

const moderationSchema = {
  flagged: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String,
    default: null
  },
  badWordsFound: [{
    type: String
  }],
  reviewedBy: {
    type: Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
};

const discussionPostSchema = new Schema(
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
    classId: {
      type: Types.ObjectId,
      ref: 'Class',
      required: true,
    },
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
        sentiment: {
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
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        moderation: moderationSchema
      },
    ],
    sentiment: {
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
    },
    moderation: moderationSchema,
    flagged: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const DiscussionPost = model('DiscussionPost', discussionPostSchema);

export default DiscussionPost;

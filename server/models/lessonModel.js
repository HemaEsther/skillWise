import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['programming', 'mathematics', 'science', 'language', 'other']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['video', 'article', 'document', 'exercise']
    }
  }],
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // For tracking lesson engagement
  views: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  // For doubt solver bot to better match questions with lessons
  keywords: [{
    type: String,
    trim: true
  }]
});

// Update the updatedAt timestamp before saving
lessonSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add text indexes for better search performance
lessonSchema.index({ title: 'text', description: 'text', keywords: 'text' });

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson; 
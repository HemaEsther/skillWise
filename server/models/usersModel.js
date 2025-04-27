import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  role: {
    type: String,
    enum: ['learner', 'mentor', 'both', 'admin'],
    default: 'learner',
  },

  skills: {
    type: [String],
    default: [],
  },

  bio: {
    type: String,
    default: '',
  },

  profilePicture: {
    type: String,
    default: '', // Can store image URL
  },
  isVerifiedMentor: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationRequested: {
    type: Boolean,
    default: false,
  },
  verificationRequestDate: {
    type: Date,
    default: null,
  }
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

export default User;

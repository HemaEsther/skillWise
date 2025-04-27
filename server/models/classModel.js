import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const classSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    contentType: { type: String, required: true },
    contentUrl: { type: String },
    price: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },  // Average rating of the class
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxStudents: { type: Number, default: 30 },
  },
  { timestamps: true }
);

const Class = mongoose.model('Class', classSchema);

export default Class;

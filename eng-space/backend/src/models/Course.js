const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    lessonId: String,
    type: { type: String, enum: ['video', 'text', 'quiz'], default: 'video' },
    title: String,
    time: String,
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    moduleId: String,
    title: String,
    meta: String,
    lessons: [lessonSchema],
  },
  { _id: false }
);

const skillSchema = new mongoose.Schema(
  {
    title: String,
    details: String,
    icon: String,
  },
  { _id: false }
);

const highlightSchema = new mongoose.Schema(
  {
    icon: String,
    label: String,
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    name: String,
    avatar: String,
    rating: { type: Number, min: 1, max: 5, default: 5 },
    date: String,
    text: String,
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    longDescription: { type: String },
    summary: { type: String },
    price: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    category: { type: String, default: 'General' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image: { type: String },
    previewVideo: { type: String },
    studentsCount: { type: Number, default: 0 },
    durationHours: { type: Number, default: 0 },
    skills: [skillSchema],
    requirements: [String],
    curriculum: [moduleSchema],
    highlights: [highlightSchema],
    details: {
      type: Map,
      of: String,
      default: {},
    },
    availableInPlans: [{ type: String, enum: ['plus', 'business', 'enterprise'] }],
    allowIndividualPurchase: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);

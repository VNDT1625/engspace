const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    q: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: String, required: true },
    explanation: String,
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    image: String,
    category: { type: String, default: 'General' },
    level: { type: String, default: 'Beginner' },
    duration: { type: String, default: '15 phút' },
    players: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    tags: [String],
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    courseSlug: String,
    moduleId: String,
    lessonId: String,
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);


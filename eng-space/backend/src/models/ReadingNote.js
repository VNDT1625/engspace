const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema(
  {
    phrase: { type: String, required: true, trim: true },
    purpose: { type: String, default: '', trim: true },
    translation: { type: String, default: '', trim: true },
    source: { type: String, default: 'selection', trim: true },
  },
  { _id: false }
);

const readingNoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reading: { type: mongoose.Schema.Types.ObjectId, ref: 'Reading', required: true },
    mode: { type: String, enum: ['practice', 'exam'], default: 'practice' },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    highlights: { type: [highlightSchema], default: [] },
    durationSeconds: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    totalGradableQuestions: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReadingNote', readingNoteSchema);

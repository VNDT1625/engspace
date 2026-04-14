const mongoose = require('mongoose');

const vocabSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    word: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    meaning: {
        type: String,
        required: true
    },
    synonyms: [String],
    examples: [String],
    sourceUrl: {
        type: String,
        default: ''
    },
    context: String, // trang web/context khi select
    reviewCount: {
        type: Number,
        default: 0
    },
    lastReviewed: {
        type: Date,
        default: Date.now
    },
    nextReview: Date, // spaced repetition
    tags: [String],
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    }
}, {
    timestamps: true
});

// Index cho query nhanh
vocabSchema.index({ userId: 1, createdAt: -1 });
vocabSchema.index({ word: 1, userId: 1 });

module.exports = mongoose.model('VocabWord', vocabSchema);


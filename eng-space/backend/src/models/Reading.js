const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    qNumber: Number,
    qText: String,
    answer: mongoose.Schema.Types.Mixed,
    acceptedAnswers: [String]
});

const headingOptionSchema = new mongoose.Schema({
    val: String,
    text: String
});

const questionGroupSchema = new mongoose.Schema({
    title: String,
    instruction: String,
    type: String, // TFNG, MATCHING, MULTIPLE_CHOICE, etc.
    headingOptions: [headingOptionSchema],
    questions: [questionSchema]
});

const readingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: { type: String, default: 'Medium' }, // Easy, Medium, Hard
    thumbnail: { type: String },
    timeLimit: { type: Number, default: 60 },
    totalQuestions: { type: Number, default: 0 },
    description: { type: String },
    content: { type: String, required: true },
    questionGroups: [questionGroupSchema]
}, { timestamps: true });

module.exports = mongoose.model('Reading', readingSchema);

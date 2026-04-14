const QuizResult = require('../models/QuizResult');

exports.record = async (req, res) => {
  try {
    const { quizId, score, correctAnswers, totalQuestions, durationSeconds } = req.body;
    if (!quizId) return res.status(400).json({ message: 'quizId is required' });

    const attempt = await QuizResult.create({
      user: req.user._id,
      quiz: quizId,
      score,
      correctAnswers,
      totalQuestions,
      durationSeconds,
    });

    const populated = await attempt.populate('quiz', 'title slug');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listMine = async (req, res) => {
  try {
    const attempts = await QuizResult.find({ user: req.user._id })
      .sort({ takenAt: -1 })
      .populate('quiz', 'title slug category');
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


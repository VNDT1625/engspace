const Quiz = require('../models/Quiz');

exports.list = async (req, res) => {
  const { category, courseSlug } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (courseSlug) filter.courseSlug = courseSlug;
  const quizzes = await Quiz.find(filter).sort({ createdAt: -1 }).populate('course', 'title slug image');
  res.json(quizzes);
};

exports.getBySlug = async (req, res) => {
  const quiz = await Quiz.findOne({ slug: req.params.slug }).populate('course', 'title slug image');
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  res.json(quiz);
};

exports.getByLesson = async (req, res) => {
  const { courseSlug, lessonId } = req.params;
  const quiz = await Quiz.findOne({ courseSlug, lessonId }).populate('course', 'title slug image');
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
  res.json(quiz);
};

exports.create = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (err) {
    console.error('Create quiz error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Slug đã tồn tại. Vui lòng chọn slug khác.' });
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: `Lỗi validation: ${errors}` });
    }
    res.status(500).json({ message: err.message || 'Không thể tạo quiz' });
  }
};

exports.update = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!quiz) return res.status(404).json({ message: 'Không tìm thấy quiz' });
    res.json(quiz);
  } catch (err) {
    console.error('Update quiz error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Slug đã tồn tại. Vui lòng chọn slug khác.' });
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: `Lỗi validation: ${errors}` });
    }
    res.status(500).json({ message: err.message || 'Không thể cập nhật quiz' });
  }
};

exports.delete = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Không tìm thấy quiz' });
    res.json({ message: 'Đã xóa quiz thành công' });
  } catch (err) {
    console.error('Delete quiz error:', err);
    res.status(500).json({ message: err.message || 'Không thể xóa quiz' });
  }
};


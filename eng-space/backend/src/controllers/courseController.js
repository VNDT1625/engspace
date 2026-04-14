const Course = require('../models/Course');

exports.list = async (req, res) => {
  const { q, level, featured } = req.query;
  const filter = {};
  if (q) filter.title = { $regex: q, $options: 'i' };
  if (level) filter.level = level;
  if (featured) filter.featured = featured === 'true';
  const courses = await Course.find(filter).populate('instructor', 'name email');
  res.json(courses);
};

exports.getBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).populate('instructor');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.get = async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'name email');
  if (!course) return res.status(404).json({ message: 'Not found' });
  res.json(course);
};

const slugify = (str = '') =>
  String(str)
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

exports.create = async (req, res) => {
  try {
    const data = req.body;
    console.log('Received course data:', JSON.stringify(data, null, 2)); // Debug

    // Clean up data - remove undefined/null values
    const cleanData = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        cleanData[key] = data[key];
      }
    });

    // Auto-generate slug from title if missing
    if (!cleanData.slug && cleanData.title) {
      cleanData.slug = slugify(cleanData.title);
    }

    console.log('Clean course data:', JSON.stringify(cleanData, null, 2)); // Debug

    const course = new Course(cleanData);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error('Create course error:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      errors: err.errors
    }); // Debug
    // Handle duplicate slug error
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Slug đã tồn tại. Vui lòng chọn slug khác.' });
    }
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: `Lỗi validation: ${errors}` });
    }
    res.status(500).json({ message: err.message || 'Không thể tạo khóa học' });
  }
};

exports.update = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    res.json(course);
  } catch (err) {
    console.error('Update course error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Slug đã tồn tại. Vui lòng chọn slug khác.' });
    }
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: `Lỗi validation: ${errors}` });
    }
    res.status(500).json({ message: err.message || 'Không thể cập nhật khóa học' });
  }
};

exports.remove = async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};

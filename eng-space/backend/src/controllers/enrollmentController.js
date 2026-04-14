const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

exports.enroll = async (req, res) => {
  const { courseId, pricePaid = 0, paymentMethod } = req.body;
  const studentId = req.user._id;

  // prevent duplicate
  const exists = await Enrollment.findOne({ student: studentId, course: courseId });
  if (exists) return res.status(400).json({ message: 'Already enrolled' });

  const enrollment = new Enrollment({ student: studentId, course: courseId, pricePaid, paymentMethod, status: 'active' });
  await enrollment.save();

  // increment studentsCount
  await Course.findByIdAndUpdate(courseId, { $inc: { studentsCount: 1 } });

  res.status(201).json(enrollment);
};

exports.listMy = async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate('course');
  res.json(enrollments);
};

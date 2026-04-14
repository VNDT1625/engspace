const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const path = require('path');

const currencyFormat = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

const buildRevenueSummary = async () => {
  const payments = await Payment.aggregate([
    { $match: { status: 'paid' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const total = payments.reduce((sum, entry) => sum + entry.total, 0);
  return { total, timeline: payments };
};

exports.dashboardSummary = async (req, res) => {
  const [revenue, courseCount, quizCount, contactCount] = await Promise.all([
    buildRevenueSummary(),
    Course.countDocuments(),
    Quiz.countDocuments(),
    ContactMessage.countDocuments({ status: 'new' }),
  ]);

  res.json({
    revenue,
    courseCount,
    quizCount,
    pendingContacts: contactCount,
  });
};

exports.exportRevenuePdf = async (req, res) => {
  const summary = await buildRevenueSummary();
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="engspace-revenue.pdf"');

  doc.pipe(res);
  doc.fontSize(18).text('EngSpace - Báo cáo doanh thu', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Tổng doanh thu: ${currencyFormat(summary.total)}`);
  doc.moveDown();
  doc.text('Chi tiết theo ngày:');
  summary.timeline.forEach((entry) => {
    doc.text(`${entry._id}: ${currencyFormat(entry.total)}`);
  });
  doc.end();
};

exports.exportRevenueDoc = async (req, res) => {
  const summary = await buildRevenueSummary();
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'EngSpace - Báo cáo doanh thu', bold: true, size: 32 })],
          }),
          new Paragraph({
            spacing: { before: 200, after: 200 },
            children: [new TextRun({ text: `Tổng: ${currencyFormat(summary.total)}`, size: 24 })],
          }),
          ...summary.timeline.map(
            (entry) =>
              new Paragraph({
                children: [new TextRun({ text: `${entry._id}: ${currencyFormat(entry.total)}`, size: 22 })],
              })
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', 'attachment; filename="engspace-revenue.docx"');
  res.send(buffer);
};

// User Management Functions
exports.listUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    
    if (role && ['student', 'instructor', 'admin'].includes(role)) {
      filter.role = role;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;
  
  try {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Tạo user với role admin
    const admin = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin',
    });

    await admin.save();

    // Trả về user không có password
    const adminData = admin.toObject();
    delete adminData.password;

    res.status(201).json({
      message: 'Đã tạo admin thành công',
      user: adminData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role không hợp lệ' });
    }

    // Không cho phép tự sửa role của chính mình
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Không thể thay đổi quyền của chính bạn' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    // Không cho phép xóa quyền admin của admin khác nếu chỉ còn 1 admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Không thể xóa quyền admin. Hệ thống cần ít nhất 1 admin' });
      }
    }

    user.role = role;
    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Đã cập nhật quyền thành công',
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Không cho phép xóa chính mình
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Không thể xóa chính bạn' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    // Không cho phép xóa admin nếu chỉ còn 1 admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Không thể xóa admin. Hệ thống cần ít nhất 1 admin' });
      }
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'Đã xóa user thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }

    // Trả về URL của file đã upload
    // URL sẽ là: /uploads/filename
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Upload thành công',
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


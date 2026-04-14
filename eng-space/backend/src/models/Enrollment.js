const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['pending','active','cancelled','completed'], default: 'active' },
  pricePaid: { type: Number, default: 0 },
  paymentMethod: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);

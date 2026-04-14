const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['course', 'plan'], required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    plan: { type: String, enum: ['plus', 'business', 'enterprise'] },
    billingCycle: { type: String, enum: ['monthly', 'yearly', 'lifetime'], default: 'monthly' },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'paid' },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'VND' },
    method: { type: String, default: 'credit' },
    notes: { type: String },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);


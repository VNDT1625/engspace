const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PLAN_TYPES = ['free', 'plus', 'business', 'enterprise'];

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['student','instructor','admin'], default: 'student' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar: { type: String },
  bio: { type: String },
  plan: { type: String, enum: PLAN_TYPES, default: 'free' },
  planExpiresAt: { type: Date },
}, { timestamps: true });

// hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.statics.PLAN_TYPES = PLAN_TYPES;

module.exports = mongoose.model('User', userSchema);

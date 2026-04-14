const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const genToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  plan: user.plan,
  planExpiresAt: user.planExpiresAt,
  planActive: user.plan !== 'free' && (!user.planExpiresAt || user.planExpiresAt > new Date()),
});

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;
  try {
    let exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: 'Email already registered' });

    const user = new User({ name, email, password, role });
    await user.save();

    res.json({ token: genToken(user), user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({ token: genToken(user), user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ user: formatUser(req.user) });
};

exports.updateMe = async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'password', 'avatar', 'bio'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (updates.email && updates.email !== user.email) {
      const exists = await User.findOne({ email: updates.email });
      if (exists && exists._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = updates.email;
    }

    if (updates.name) user.name = updates.name;
    if (updates.avatar) user.avatar = updates.avatar;
    if (updates.bio) user.bio = updates.bio;
    if (updates.password) user.password = updates.password;

    await user.save();

    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { plan, durationDays = 30, expiresAt } = req.body;
    const allowedPlans = User.PLAN_TYPES || ['free', 'plus', 'business', 'enterprise'];
    if (!plan || !allowedPlans.includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan selection' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.plan = plan;
    if (expiresAt) {
      user.planExpiresAt = new Date(expiresAt);
    } else if (plan === 'free') {
      user.planExpiresAt = null;
    } else {
      const durationMs = Number(durationDays) * 24 * 60 * 60 * 1000;
      const baseDate = user.planExpiresAt && user.planExpiresAt > new Date() ? user.planExpiresAt : new Date();
      user.planExpiresAt = new Date(baseDate.getTime() + durationMs);
    }

    await user.save();
    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.formatUser = formatUser;

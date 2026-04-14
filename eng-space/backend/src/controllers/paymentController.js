const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { formatUser } = require('./authController');

const PLAN_PRICING = {
  plus: {
    monthly: { price: 290000, durationDays: 30, label: 'Plus Monthly' },
    yearly: { price: 2990000, durationDays: 365, label: 'Plus Yearly' },
  },
  business: {
    monthly: { price: 590000, durationDays: 30, label: 'Business Monthly' },
    yearly: { price: 5990000, durationDays: 365, label: 'Business Yearly' },
  },
  enterprise: {
    monthly: { price: 1250000, durationDays: 30, label: 'Enterprise Monthly' },
    yearly: { price: 12990000, durationDays: 365, label: 'Enterprise Yearly' },
  },
};

const DAY_MS = 24 * 60 * 60 * 1000;

exports.purchaseCourse = async (req, res) => {
  try {
    const { courseId, paymentMethod = 'credit', notes } = req.body;
    if (!courseId) return res.status(400).json({ message: 'Missing courseId' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const exists = await Enrollment.findOne({ student: req.user._id, course: course._id });
    if (exists) {
      return res.status(400).json({ message: 'You already own this course.' });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: course._id,
      pricePaid: course.price || 0,
      paymentMethod,
      status: 'active',
    });

    await Course.findByIdAndUpdate(course._id, { $inc: { studentsCount: 1 } });

    const payment = await Payment.create({
      user: req.user._id,
      type: 'course',
      course: course._id,
      status: 'paid',
      amount: course.price || 0,
      currency: 'VND',
      method: paymentMethod,
      notes,
      metadata: {
        courseSlug: course.slug,
        courseTitle: course.title,
      },
    });

    return res.status(201).json({ enrollment, payment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unable to process payment' });
  }
};

exports.purchasePlan = async (req, res) => {
  try {
    const { plan, billingCycle = 'monthly', paymentMethod = 'credit' } = req.body;
    const planConfig = PLAN_PRICING[plan]?.[billingCycle];
    if (!planConfig) {
      return res.status(400).json({ message: 'Invalid plan or billing cycle' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const baseDate =
      user.plan === plan && user.planExpiresAt && user.planExpiresAt > now ? user.planExpiresAt : now;
    const planExpiresAt = new Date(baseDate.getTime() + planConfig.durationDays * DAY_MS);

    user.plan = plan;
    user.planExpiresAt = plan === 'free' ? null : planExpiresAt;
    await user.save();

    const payment = await Payment.create({
      user: user._id,
      type: 'plan',
      plan,
      billingCycle,
      status: 'paid',
      amount: planConfig.price,
      currency: 'VND',
      method: paymentMethod,
      metadata: {
        planLabel: planConfig.label,
      },
    });

    return res.json({
      user: formatUser(user),
      payment,
      plan: {
        id: plan,
        billingCycle,
        price: planConfig.price,
        expiresAt: user.planExpiresAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unable to process plan payment' });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(payments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unable to fetch payments' });
  }
};

exports.PLAN_PRICING = PLAN_PRICING;


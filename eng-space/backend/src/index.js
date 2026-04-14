require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const open = require('open').default;   // 👈 sửa ở đây

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const quizRoutes = require('./routes/quizzes');
const paymentRoutes = require('./routes/payments');
const blogRoutes = require('./routes/blog');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const readingRoutes = require('./routes/readings');
const aiRoutes = require('./routes/ai');
const extensionRoutes = require('./routes/extension');
const Course = require('./models/Course');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/engspace');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/extension', extensionRoutes);

app.get("/courses/:slug", async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug });
  res.json(course);
});



app.get('/', (req, res) => res.send({ ok: true, message: 'EngSpace API' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  open(`http://localhost:${PORT}`);
});

require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');

const seed = async () => {
  await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/engspace');

  await User.deleteMany({});
  await Course.deleteMany({});
  await Quiz.deleteMany({});

  const admin = await User.create({ name: 'Admin', email: 'admin@engspace.test', password: '123456', role: 'admin' });
  const instructor = await User.create({ name: 'John Teacher', email: 'john@engspace.test', password: '123456', role: 'instructor' });
  const student = await User.create({
    name: 'Student One',
    email: 'student@engspace.test',
    password: '123456',
    role: 'student',
    plan: 'plus',
    planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  const fullStackCourse = await Course.create({
    title: 'IELTS Academic Intensive',
    slug: 'ielts-academic-intensive',
    description: 'Intensive IELTS Academic preparation for all 4 skills: Listening, Reading, Writing, Speaking.',
    longDescription: 'Practice with real‑style IELTS tasks, band‑descriptors based feedback, and strategies for each part of the exam.',
    summary: 'Focused roadmap to move from band 5.0–6.0 lên 6.5+ với luyện đề và phân tích chi tiết.',
    price: 1490000,
    featured: true,
    level: 'Advanced',
    category: 'IELTS',
    instructor: instructor._id,
    image: '/assets/img/education/courses-8.webp',
    previewVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    studentsCount: 3892,
    durationHours: 48,
    skills: [
      { title: 'Frontend Development', details: 'React, JavaScript ES6+, HTML5 & CSS3', icon: 'bi bi-code-slash' },
      { title: 'Backend Development', details: 'Node.js, Express.js, RESTful APIs', icon: 'bi bi-server' },
      { title: 'Database Management', details: 'MongoDB, Mongoose, Data Modeling', icon: 'bi bi-database' },
      { title: 'Security & Testing', details: 'Authentication, JWT, Unit Testing', icon: 'bi bi-shield-check' },
    ],
    requirements: [
      'Basic understanding of HTML and CSS',
      'Familiarity with JavaScript fundamentals',
      'Computer with internet connection',
      'Text editor or IDE installed',
    ],
    curriculum: [
      {
        moduleId: 'module1',
        title: 'JavaScript Fundamentals & ES6+',
        meta: '8 lessons • 4h 15m',
        lessons: [
          { lessonId: 'module1-lesson1', type: 'video', title: 'Variables, Functions and Scope', time: '28 min' },
          { lessonId: 'module1-lesson2', type: 'video', title: 'Arrow Functions and Destructuring', time: '35 min' },
          { lessonId: 'module1-lesson3', type: 'text', title: 'Promises and Async/Await', time: '42 min' },
        ],
      },
      {
        moduleId: 'module2',
        title: 'React Development Deep Dive',
        meta: '12 lessons • 7h 45m',
        lessons: [
          { lessonId: 'module2-lesson1', type: 'video', title: 'Components and JSX Syntax', time: '32 min' },
          { lessonId: 'module2-lesson2', type: 'video', title: 'State Management with Hooks', time: '48 min' },
        ],
      },
      {
        moduleId: 'module3',
        title: 'Node.js & Server Development',
        meta: '15 lessons • 8h 20m',
        lessons: [
          { lessonId: 'module3-lesson1', type: 'video', title: 'Express.js Server Setup', time: '25 min' },
          { lessonId: 'module3-lesson2', type: 'text', title: 'Building RESTful APIs', time: '55 min' },
        ],
      },
    ],
    highlights: [
      { icon: 'bi bi-trophy', label: 'Certificate included' },
      { icon: 'bi bi-clock-history', label: '45 hours content' },
      { icon: 'bi bi-download', label: 'Downloadable resources' },
      { icon: 'bi bi-infinity', label: 'Lifetime access' },
      { icon: 'bi bi-phone', label: 'Mobile access' },
    ],
    details: {
      Duration: '16 weeks',
      'Skill Level': 'Intermediate',
      Language: 'English',
      Quizzes: '24',
      Assignments: '8 projects',
      Updated: 'December 2024',
    },
    rating: 4.8,
    reviewCount: 1247,
    reviews: [
      {
        name: 'Jessica Chen',
        avatar: '/assets/img/person/person-f-12.webp',
        rating: 5,
        date: '2 weeks ago',
        text: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. The instructor explains complex concepts very clearly.',
      },
      {
        name: 'David Thompson',
        avatar: '/assets/img/person/person-m-5.webp',
        rating: 4,
        date: '1 month ago',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Great practical examples and real-world projects that helped me understand the concepts better.',
      },
    ],
    ],
    availableInPlans: ['plus', 'business', 'enterprise'],
    allowIndividualPurchase: true,
  });

  const designCourse = await Course.create({
    title: 'TOEIC 700+ Target',
    slug: 'toeic-700-plus',
    description: 'Complete TOEIC preparation for Listening & Reading to reach 700+ score.',
    longDescription: 'Master key TOEIC question types, time‑management techniques, and vocabulary for the workplace.',
    price: 0,
    instructor: instructor._id,
    durationHours: 20,
    level: 'Intermediate',
    category: 'TOEIC',
    studentsCount: 1240,
    details: {
      Duration: '10 weeks',
      'Skill Level': 'Beginner',
      Language: 'English',
      Updated: 'November 2024',
    },
    availableInPlans: ['business', 'enterprise'],
    allowIndividualPurchase: true,
  });

  const communicationCourse = await Course.create({
    title: 'Office English Communication B1',
    slug: 'office-english-communication-b1',
    description: 'Practical English communication skills for the workplace.',
    longDescription: 'Master greetings, small talk, and meeting etiquette with realistic scenarios.',
    price: 590000,
    instructor: instructor._id,
    durationHours: 12,
    level: 'Intermediate',
    category: 'English Communication',
    image: '/assets/img/education/quiz-1.webp',
    studentsCount: 980,
    curriculum: [
      {
        moduleId: 'module1',
        title: 'Office Basics',
        meta: '5 lessons • 2h 10m',
        lessons: [
          { lessonId: 'module1-lesson1', type: 'video', title: 'Greetings & Introductions', time: '18 min' },
          { lessonId: 'module1-lesson2', type: 'quiz', title: 'Office Greetings Quiz', time: '10 min' },
        ],
      },
    ],
    availableInPlans: ['plus', 'business', 'enterprise'],
    allowIndividualPurchase: true,
  });

  await Quiz.create([
    {
      slug: 'office-greetings-quiz',
      title: 'Office Greetings Quiz',
      description: 'Check how well you greet colleagues and stakeholders in professional settings.',
      image: '/assets/img/education/quiz-1.webp',
      category: 'Communication',
      level: 'Intermediate',
      duration: '10 phút',
      players: 450,
      completionRate: 92,
      course: communicationCourse._id,
      courseSlug: communicationCourse.slug,
      moduleId: 'module1',
      lessonId: 'module1-lesson2',
      tags: ['business', 'soft skills', 'english'],
      questions: [
        {
          q: 'How do you greet a colleague in the office?',
          options: ['Hello!', 'Yo!', 'Sup!'],
          answer: 'Hello!',
        },
        {
          q: 'What is the polite way to greet a new partner?',
          options: ['Nice to meet you', 'Hey there', 'What’s up'],
          answer: 'Nice to meet you',
        },
      ],
    },
    {
      slug: 'fullstack-self-introduction',
      title: 'Self Introduction Quiz',
      description: 'Present yourself confidently to teams and hiring managers.',
      image: '/assets/img/education/quiz-3.webp',
      category: 'Career',
      level: 'Beginner',
      duration: '12 phút',
      players: 320,
      completionRate: 88,
      course: fullStackCourse._id,
      courseSlug: fullStackCourse.slug,
      moduleId: 'module1',
      lessonId: 'module1-lesson3',
      tags: ['soft skills', 'communication', 'english'],
      questions: [
        {
          q: 'How do you introduce yourself?',
          options: ['Name only', 'Name + hobby', 'Full introduction'],
          answer: 'Full introduction',
        },
        {
          q: 'What is the polite way to greet?',
          options: ['Hi', 'Hello, nice to meet you', 'Yo'],
          answer: 'Hello, nice to meet you',
        },
      ],
    },
    // English-focused standalone quizzes (not tied to a specific lesson)
    {
      slug: 'daily-english-conversation-a1',
      title: 'Daily English Conversation A1',
      description: 'Basic everyday English for beginners: greetings, small talk, and simple questions.',
      image: '/assets/img/education/courses-3.webp',
      category: 'English',
      level: 'Beginner',
      duration: '8 phút',
      players: 180,
      completionRate: 86,
      tags: ['english', 'conversation', 'daily English'],
      questions: [
        {
          q: 'How do you say “Xin chào” in English when you meet someone for the first time?',
          options: ['Hey you', 'Hello', 'Good night'],
          answer: 'Hello',
        },
        {
          q: 'Someone says “How are you?”. What is the most natural reply?',
          options: ['I am fine, thank you.', 'I am go to school.', 'I very like.'],
          answer: 'I am fine, thank you.',
        },
        {
          q: 'Which sentence is correct when you introduce your name?',
          options: ['My name is John.', 'I name John.', 'Me is John.'],
          answer: 'My name is John.',
        },
      ],
    },
    {
      slug: 'english-vocabulary-office-basics',
      title: 'English Vocabulary: Office Basics',
      description: 'Test your English vocabulary about common office objects and places.',
      image: '/assets/img/education/courses-4.webp',
      category: 'English',
      level: 'Beginner',
      duration: '10 phút',
      players: 95,
      completionRate: 79,
      tags: ['english', 'vocabulary', 'office'],
      questions: [
        {
          q: 'Which word means “phòng họp” in English?',
          options: ['Meeting room', 'Living room', 'Dining room'],
          answer: 'Meeting room',
        },
        {
          q: 'What do we call “máy tính xách tay” in English?',
          options: ['Desktop', 'Laptop', 'Keyboard'],
          answer: 'Laptop',
        },
        {
          q: 'Which word is the correct English for “lịch làm việc”?',
          options: ['Notebook', 'Schedule', 'Message'],
          answer: 'Schedule',
        },
      ],
    },
  ]);

  console.log('Seed done');
  process.exit(0);
};

seed();

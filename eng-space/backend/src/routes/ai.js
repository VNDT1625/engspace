const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Xoá .protect mapping để đơn giản hoá việc setup UI test, bạn có thể require protect sau
// POST /api/ai/chat
router.post('/chat', aiController.chat);

// POST /api/ai/video-chat
router.post('/video-chat', aiController.videoChat);

module.exports = router;

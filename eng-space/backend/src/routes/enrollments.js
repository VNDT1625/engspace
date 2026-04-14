const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const enrollmentCtrl = require('../controllers/enrollmentController');

router.post('/', authMiddleware, enrollmentCtrl.enroll);
router.get('/me', authMiddleware, enrollmentCtrl.listMy);

module.exports = router;

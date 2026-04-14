const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  authCtrl.register
);

router.post('/login', authCtrl.login);
router.get('/me', authMiddleware, authCtrl.getMe);
router.put('/me', authMiddleware, authCtrl.updateMe);
router.post('/plan', authMiddleware, authCtrl.updatePlan);

module.exports = router;

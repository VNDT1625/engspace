const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/course', authMiddleware, paymentController.purchaseCourse);
router.post('/plan', authMiddleware, paymentController.purchasePlan);
router.get('/me', authMiddleware, paymentController.getMyPayments);

module.exports = router;


const router = require('express').Router();
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/summary', authMiddleware, adminOnly, adminController.dashboardSummary);
router.get('/revenue/pdf', authMiddleware, adminOnly, adminController.exportRevenuePdf);
router.get('/revenue/doc', authMiddleware, adminOnly, adminController.exportRevenueDoc);

// User Management Routes
router.get('/users', authMiddleware, adminOnly, adminController.listUsers);
router.post(
  '/users',
  authMiddleware,
  adminOnly,
  [
    body('name').notEmpty().withMessage('Tên là bắt buộc'),
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  ],
  adminController.createAdmin
);
router.put('/users/:id/role', authMiddleware, adminOnly, adminController.updateUserRole);
router.delete('/users/:id', authMiddleware, adminOnly, adminController.deleteUser);

// Upload Routes
router.post('/upload/image', authMiddleware, adminOnly, upload.single('image'), adminController.uploadImage);

module.exports = router;




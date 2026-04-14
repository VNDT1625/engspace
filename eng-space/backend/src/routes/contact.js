const router = require('express').Router();
const contactController = require('../controllers/contactController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const optionalAuth = require('../utils/optionalAuth');

router.post('/', optionalAuth, contactController.submit);
router.get('/me', authMiddleware, contactController.getMyMessages);
router.get('/', authMiddleware, adminOnly, contactController.list);
router.put('/:id', authMiddleware, adminOnly, contactController.updateStatus);

module.exports = router;




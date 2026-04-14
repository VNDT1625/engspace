const router = require('express').Router();
const blogController = require('../controllers/blogController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/', blogController.list);
router.get('/slug/:slug', blogController.getBySlug);
router.get('/:id', authMiddleware, adminOnly, blogController.get);

router.post('/', authMiddleware, adminOnly, blogController.create);
router.put('/:id', authMiddleware, adminOnly, blogController.update);
router.delete('/:id', authMiddleware, adminOnly, blogController.remove);

module.exports = router;




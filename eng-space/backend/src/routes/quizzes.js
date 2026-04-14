const router = require('express').Router();
const quizController = require('../controllers/quizController');
const quizResultController = require('../controllers/quizResultController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', quizController.list);
router.get('/lesson/:courseSlug/:lessonId', quizController.getByLesson);
router.get('/:slug', quizController.getBySlug);
router.post('/', authMiddleware, quizController.create);
router.put('/:id', authMiddleware, quizController.update);
router.delete('/:id', authMiddleware, quizController.delete);

router.post('/results', authMiddleware, quizResultController.record);
router.get('/results/me', authMiddleware, quizResultController.listMine);

module.exports = router;


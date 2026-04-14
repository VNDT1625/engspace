const express = require('express');
const router = express.Router();
const readingController = require('../controllers/readingController');
const { authMiddleware } = require('../middleware/auth');

// GET /api/readings
router.get('/', readingController.getReadings);

// GET /api/readings/translate?text=
router.get('/translate', readingController.translateText);

// POST /api/readings/notes
router.post('/notes', authMiddleware, readingController.saveReadingNote);

// GET /api/readings/notes/me
router.get('/notes/me', authMiddleware, readingController.getMyReadingNotes);

// POST /api/readings/submit
router.post('/submit', authMiddleware, readingController.submitReadingAttempt);

// GET /api/readings/results/me
router.get('/results/me', authMiddleware, readingController.getMyReadingResults);

// GET /api/readings/results/:id
router.get('/results/:id', authMiddleware, readingController.getReadingResultDetail);

// GET /api/readings/:slug
router.get('/:slug', readingController.getReadingDetail);

module.exports = router;

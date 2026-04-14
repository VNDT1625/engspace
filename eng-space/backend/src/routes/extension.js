const express = require('express');
const { explainVocab, saveVocab, getMyVocab } = require('../controllers/extensionController');
const { authMiddleware: auth } = require('../middleware/auth');

const router = express.Router();

router.post('/ai-explain', auth, explainVocab);
router.post('/save-vocab', auth, saveVocab);
router.get('/my-vocab', auth, getMyVocab);

module.exports = router;





const express = require('express');
const router = express.Router();
const courseCtrl = require('../controllers/courseController');
console.log("COURSE CTRL:", courseCtrl);
const { authMiddleware } = require('../middleware/auth');

// public list and get
router.get('/', courseCtrl.list);
router.get('/slug/:slug', courseCtrl.getBySlug); // lấy 1 course theo slug

// protected for create/update/delete (you can add adminOnly later)
router.post('/', authMiddleware, courseCtrl.create);
router.put('/:id', authMiddleware, courseCtrl.update);
router.delete('/:id', authMiddleware, courseCtrl.remove);

module.exports = router;

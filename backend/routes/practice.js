const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const {
  createPracticeResult,
  getPracticeStats,
} = require('../controllers/practiceController');

router.post('/results', verifyToken, createPracticeResult);
router.get('/stats', verifyToken, getPracticeStats);

module.exports = router;

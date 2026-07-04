const express = require('express');
const router = express.Router();
const { getAllSamples, bulkInsertSamples, clearAllSamples } = require('../controllers/trainingController');
const verifyToken = require('../middleware/auth');

router.get('/', getAllSamples);              // Public — SignPredictor cần đọc, không bắt buộc login
router.post('/bulk', verifyToken, bulkInsertSamples);  // Cần login mới được ghi dữ liệu
router.delete('/', verifyToken, clearAllSamples);

module.exports = router;
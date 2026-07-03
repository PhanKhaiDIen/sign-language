const express = require('express');
const router = express.Router();
const {
    getAllSigns,
    getSignById,
    createSign,
    updateSign,
    deleteSign
} = require('../controllers/signsController');
const verifyToken = require('../middleware/auth');

router.get('/', getAllSigns);
router.get('/:id', getSignById);

router.post('/', verifyToken, createSign);
router.put('/:id', verifyToken, updateSign);
router.delete('/:id', verifyToken, deleteSign);

module.exports = router;
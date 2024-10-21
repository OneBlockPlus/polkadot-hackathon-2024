const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/', async (req, res, next) => {
    try {
        const stats = await statsController.getStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
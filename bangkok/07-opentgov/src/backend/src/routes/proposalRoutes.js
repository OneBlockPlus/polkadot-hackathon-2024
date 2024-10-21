const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');

router.get('/', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const proposals = await proposalController.fetchProposals(limit);
        res.json({ success: true, data: proposals });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
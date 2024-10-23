const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');

router.post('/', async (req, res, next) => {
    try {
        const { telegramId, proposalId, vote, balance, conviction } = req.body;
        const hash = await voteController.submitVote(telegramId, proposalId, vote, balance, conviction);
        res.json({ success: true, hash });
    } catch (error) {
        next(error);
    }
});

router.get('/history/:telegramId', async (req, res, next) => {
    try {
        const { telegramId } = req.params;
        const history = await voteController.getUserVotingHistory(telegramId);
        res.json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
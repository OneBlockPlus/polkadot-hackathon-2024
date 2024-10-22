const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', async (req, res, next) => {
    try {
        const { chatId, telegramId } = req.body;
        await userController.registerUser(chatId, telegramId);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.post('/update', async (req, res, next) => {
    try {
        const { telegramId, voterAddress } = req.body;
        const result = await userController.updateUser(telegramId, voterAddress);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

router.post('/remove-proxy', async (req, res, next) => {
    try {
        const { telegramId } = req.body;
        const result = await userController.removeProxy(telegramId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
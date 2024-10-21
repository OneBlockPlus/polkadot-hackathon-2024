const express = require('express');
const cors = require('cors');
const config = require('./config');
const userRoutes = require('./routes/userRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const voteRoutes = require('./routes/voteRoutes');
const statsRoutes = require('./routes/statsRoutes');
const errorHandler = require('./middleware/errorHandler');
const bot = require('./services/telegram');
const userController = require('./controllers/userController');
const voteController = require('./controllers/voteController');
const statsController = require('./controllers/statsController');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: config.FRONTEND_URL }));

app.use('/api/users', userRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

// Telegram bot commands
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    await userController.registerUser(chatId, telegramId);
});

bot.onText(/\/vote(\s+(\d+))?\s*(aye|nay)?\s*(\d+)?\s*(\d+)?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const proposalId = match[2] ? parseInt(match[2]) : null;
    const vote = match[3] ? match[3].toLowerCase() : null;
    const balance = match[4] ? parseInt(match[4]) : null;
    const conviction = match[5] ? parseInt(match[5]) : 0;

    if (!proposalId || !vote || !balance) {
        bot.sendMessage(chatId, 'Invalid command format. Use: /vote <proposal_id> <aye/nay> <balance> [conviction]');
        return;
    }

    try {
        const hash = await voteController.submitVote(telegramId, proposalId, vote, balance, conviction);
        bot.sendMessage(chatId, `Vote submitted successfully! Transaction hash: ${hash}`);
    } catch (error) {
        bot.sendMessage(chatId, `Error submitting vote: ${error.message}`);
    }
});

bot.onText(/\/history/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    try {
        const history = await voteController.getUserVotingHistory(telegramId);
        const formattedHistory = history.map((vote, index) => {
            return `${index + 1}. Proposal #${vote.proposal_id}: ${vote.vote_decision.toUpperCase()} with ${vote.vote_balance} DOT`;
        }).join('\n');

        bot.sendMessage(chatId, `Your voting history:\n${formattedHistory}`);
    } catch (error) {
        bot.sendMessage(chatId, `Error fetching voting history: ${error.message}`);
    }
});

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const telegramId = callbackQuery.from.id;
    const action = callbackQuery.data;

    if (action === 'verify') {
        const hasBalance = await userController.checkPolkadotBalance(telegramId);
        if (hasBalance) {
            await userController.updateUser(telegramId, 1);
            bot.sendMessage(chatId, 'Balance verified successfully! You can now proceed to link your proxy.');
            await userController.handleUserStatus(1, chatId, telegramId);
        } else {
            bot.sendMessage(chatId, 'Insufficient balance. Please make sure you have sent at least 2 DOT to your proxy address.');
        }
    } else if (action === 'link_proxy') {
        const linkUrl = `${config.FRONTEND_URL}/link-proxy?telegramId=${telegramId}`;
        bot.sendMessage(chatId, `Please visit this URL to link your proxy: ${linkUrl}`);
    }
});

module.exports = app;
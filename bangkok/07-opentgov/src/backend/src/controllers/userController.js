const supabase = require('../services/database');
const bot = require('../services/telegram');
const { createPolkadotAccount, checkPolkadotBalance } = require('../services/polkadot');
const { createSecret, readSecret } = require('../services/vault');
const config = require('../config');

async function registerUser(chatId, telegramId) {
    try {
        const { address, mnemonic } = createPolkadotAccount();
        const secretData = await createSecret(`proxy_mnemonic_${telegramId}`, mnemonic);

        const { data, error } = await supabase
            .from('users')
            .insert({
                telegram_id: telegramId,
                user_status: 0,
                proxy_address: address,
                proxy_mnemonic_id: secretData
            })
            .single();

        if (error) throw error;

        console.log('User registered successfully');
        bot.sendMessage(chatId, 'Registration successful! You can now proceed with the next steps.');
        await handleUserStatus(0, chatId, telegramId);
    } catch (error) {
        console.error('Error registering user:', error);
        bot.sendMessage(chatId, 'An error occurred during registration. Please try again later.');
    }
}

async function updateUser(telegramId, voterAddress) {
    const { data, error } = await supabase
        .from('users')
        .update({
            user_status: 2,
            voter_address: voterAddress
        })
        .eq('telegram_id', telegramId);

    if (error) throw error;
    return data;
}

async function removeProxy(telegramId) {
    const { data, error } = await supabase
        .from('users')
        .update({ user_status: 4 })
        .eq('telegram_id', telegramId);

    if (error) throw error;
    return data;
}

async function handleUserStatus(status, chatId, telegramId) {
    const messages = {
        0: {
            text: `🔹 Step 2: Fund Your Proxy Address 🔹

Great! You're registered. Now it's time to fund your proxy address.

1️⃣ Send at least 2 DOT to this address:
${await getProxiedAddress(telegramId)}

2️⃣ This covers:
   • Existential Deposit (1 DOT)
   • Voting Fees (1 DOT)

3️⃣ After sending, click "Verify" to check your balance.`,
            button: { text: '✅ Verify', callback_data: 'verify' }
        },
        1: {
            text: `🔹 Step 3: Link Your Proxy 🔹

You're almost there! The final step is to link your proxy.

1️⃣ Click "Link Proxy" below
2️⃣ You'll be directed to a secure page
3️⃣ Connect your main Polkadot wallet
4️⃣ Sign the transaction to link your proxy

This step allows your proxy to vote on behalf of your main wallet.
Important: By creating a proxy, you will lock 20 DOT in your main wallet. You will not be able to use these funds until you unlink your proxy.

Ready to finish the setup?`,
            button: { text: '🔗 Link Proxy', callback_data: 'link_proxy' }
        },
        2: {
            text: `🎉 Congratulations! 🎉

Your opentgov proxy is now fully set up and linked. You can start voting on OpenGov referenda.

To vote, use the following command:
/vote <proposal_id> <aye/nay> <balance> [conviction]

Conviction is optional (0-6). If not provided, it defaults to 0 (No conviction).

Need help? Just ask in General chat!`
        }
    };

    const message = messages[status];
    if (!message) {
        bot.sendMessage(chatId, 'Oops! Something went wrong. Please start over by sending any message.');
        return;
    }

    bot.sendMessage(chatId, message.text);
    if (message.button) {
        bot.sendMessage(chatId, `Click "${message.button.text}" to continue:`, {
            reply_markup: {
                inline_keyboard: [[message.button]]
            }
        });
    }
}

async function getProxiedAddress(telegramId) {
    const { data, error } = await supabase
        .from('users')
        .select('proxy_address')
        .eq('telegram_id', telegramId)
        .single();

    if (error) throw error;
    return data.proxy_address;
}

module.exports = {
    registerUser,
    updateUser,
    removeProxy,
    handleUserStatus,
    getProxiedAddress
};
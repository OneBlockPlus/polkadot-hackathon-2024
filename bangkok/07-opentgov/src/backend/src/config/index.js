require('dotenv').config();

module.exports = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    CHANNEL_ID: process.env.CHANNEL_ID,
    SUBSCAN_API: process.env.SUBSCAN_API,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL,
    PORT: process.env.PORT || 3001,
    POLKADOT_NODE_URL: 'wss://rpc.polkadot.io',
    PEOPLE_CHAIN_URL: 'wss://sys.ibp.network/people-polkadot'
};
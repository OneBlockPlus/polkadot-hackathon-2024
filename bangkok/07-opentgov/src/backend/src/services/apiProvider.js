const { ApiPromise, WsProvider } = require('@polkadot/api');
const config = require('../config');

let api = null;

async function getApi() {
    if (!api) {
        const provider = new WsProvider(config.POLKADOT_NODE_URL);
        api = await ApiPromise.create({ provider, noInitWarn: true });
    }
    return api;
}

async function disconnectApi() {
    if (api) {
        await api.disconnect();
        api = null;
    }
}

module.exports = {
    getApi,
    disconnectApi
};
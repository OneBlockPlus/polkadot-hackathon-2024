const { ApiPromise, WsProvider } = require('@polkadot/api');
const config = require('../config');

async function queryIdentity(address) {
    const provider = new WsProvider(config.PEOPLE_CHAIN_URL);
    const api = await ApiPromise.create({ provider, noInitWarn: true, });

    try {
        const identityOpt = await api.query.identity.identityOf(address);

        if (identityOpt.isSome) {
            const identity = identityOpt.unwrap();
            let info = identity[0].info.display.__internal__raw.toUtf8();
            if (info) {
                console.log(`Display Name: ${info}`);
                return info;
            } else {
                console.log('Display name is not in Raw format');
                return address;
            }
        } else {
            console.log('No identity found for this address');
            return address;
        }
    } catch (error) {
        console.error('Error querying identity:', error);
        return address;
    } finally {
        await api.disconnect();
    }
}

module.exports = {
    queryIdentity
};
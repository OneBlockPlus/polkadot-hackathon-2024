const { Keyring } = require('@polkadot/keyring');
const { mnemonicGenerate, decodeAddress, encodeAddress } = require('@polkadot/util-crypto');
const { BN } = require('@polkadot/util');
const config = require('../config');
const supabase = require('./database');
const { fetchData } = require('./dataFetcher');
const { getApi, disconnectApi } = require('./apiProvider');

function createPolkadotAccount() {
    const mnemonic = mnemonicGenerate();
    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromMnemonic(mnemonic);
    return { address: account.address, mnemonic };
}

async function checkPolkadotBalance(address) {
    const api = await getApi();
    try {
        const { data: balance } = await api.query.system.account(address);
        const dotBalance = balance.free.div(new BN(10_000_000_000));
        return dotBalance.gte(new BN(2));
    } finally {
        await disconnectApi;
    }
}

async function compareData(oldData, newData) {
    const newPosts = [];
    const updatedPosts = [];

    newData.forEach(newPost => {
        const oldPost = oldData.find(post => post.post_id === newPost.post_id);

        if (oldPost) {
            let isUpdated = false;
            for (const key in newPost) {
                if (['created_at', 'updated_at', 'tg_id'].includes(key)) continue;

                if (typeof newPost[key] === 'number' || typeof oldPost[key] === 'number') {
                    if (Number(newPost[key]) !== Number(oldPost[key])) {
                        isUpdated = true;
                        break;
                    }
                } else if (newPost[key] !== oldPost[key]) {
                    isUpdated = true;
                    break;
                }
            }
            if (isUpdated) {
                updatedPosts.push(newPost);
            }
        } else {
            newPosts.push(newPost);
        }
    });

    return { newPosts, updatedPosts };
}

async function updateDatabase(newData) {
    const { data, error } = await supabase
        .from('referendums')
        .upsert(newData, { onConflict: 'post_id' });

    if (error) {
        console.error('Error updating Supabase:', error);
    } else {
        console.log('Supabase updated.');
    }
}

async function runPeriodically() {
    console.log('Fetching new data...');
    const newData = await fetchData();
    const { data: storedData, error } = await supabase
        .from('referendums')
        .select('*');

    if (error) {
        console.error('Error fetching stored data:', error);
        return;
    }

    const { newPosts, updatedPosts } = await compareData(storedData, newData);

    console.log('Updating database...');
    await updateDatabase(newData);

    if (newPosts.length > 0) {
        console.log(`New posts detected: ${newPosts.length}`);
    }

    if (updatedPosts.length > 0) {
        console.log(`Updated posts detected: ${updatedPosts.length}`);
    }

    if (newPosts.length === 0 && updatedPosts.length === 0) {
        console.log('No changes detected.');
    }

    console.log('Periodic run completed.');
}

module.exports = {
    createPolkadotAccount,
    checkPolkadotBalance,
    runPeriodically
};
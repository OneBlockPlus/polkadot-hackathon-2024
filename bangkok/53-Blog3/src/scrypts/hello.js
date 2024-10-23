// Import
// import { ApiPromise, WsProvider } from '@polkadot/api';
const polkaapi = require('@polkadot/api');
const { ApiPromise, WsProvider } = polkaapi;

// Construct
async function fun() {
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    // const api = await ApiPromise.create({ providers: wsProvider });

    // // Do something
    // console.log(api.genesisHash.toHex());
    ApiPromise
        .create({ provider: wsProvider })
        .then((api) => {
            // Initialize the API
            console.log(api.genesisHash.toHex());

            // The length of an epoch (session) in Babe
            console.log(api.consts.babe.epochDuration.toNumber());

            // The amount required to create a new account
            console.log(api.consts.balances.existentialDeposit.toNumber());

            // The amount required per byte on an extrinsic
            console.log(api.consts.transactionPayment.transactionByteFee.toNumber());
        });
}

fun()
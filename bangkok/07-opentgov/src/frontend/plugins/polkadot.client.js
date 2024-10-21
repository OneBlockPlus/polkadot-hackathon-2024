import { ApiPromise, WsProvider } from '@polkadot/api';
import * as wasmCrypto from '@polkadot/wasm-crypto-wasm'
import EventEmitter from 'eventemitter3'

export default defineNuxtPlugin(async () => {
    const provider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider });

    return {
        provide: {
            polkadotApi: api
        }
    }
})
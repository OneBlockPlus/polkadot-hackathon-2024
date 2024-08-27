const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { CodePromise } = require('@polkadot/api-contract');
const fs = require('fs');
const {BN} = require("@polkadot/util");

async function main() {
    // connect to local chain
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider: wsProvider });
    const privateKey = '0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133'; // Alith
    const keyring = new Keyring({ type: 'ethereum' });
    const callerAccount = keyring.addFromUri(privateKey, null, 'ethereum');
    console.log(`caller account address: ${callerAccount.address}`);

    // deploy wasm contract
    // first compiled the wasm contract to wasm and metadata, using `cargo contract build`
    const wasmPath = '../hybridvm/external/contract/src/erc20wasm/target/ink/erc20.wasm';
    const metadataPath = '../hybridvm/external/contract/src/erc20wasm/target/ink/erc20.json';
    const initSupplyAmount = "80000";
    const {contractAddress: wasmContractAddress, metadata} = await deployWasmContract(api, callerAccount, wasmPath, metadataPath, initSupplyAmount);
    console.log(`wasm contract has been deployed, the contract address is: ${wasmContractAddress}`);

    // register wasm contract, so that user can call wasm contract in the manner of calling evm contract
    await registerWasmContract(api, callerAccount, wasmContractAddress);

    process.exit(0);
}

async function deployWasmContract(api, callerAccount, wasmPath, metadataPath, initSupplyAmount) {
    const wasm = fs.readFileSync(wasmPath).toString('hex');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const code = new CodePromise(api, metadata, `0x${wasm}`);
    const gasLimit = api.registry.createType('WeightV2', {
        refTime: 100000n * 1000000n,
        proofSize: 100000n * 1000000n
    });
    const storageDepositLimit = null;
    const initSupply = new BN(initSupplyAmount.toString().concat("000000000000000000"));

    return new Promise(async (resolve, reject) => {
        try {
            const unsub = await code.tx
                .new({ gasLimit, storageDepositLimit }, initSupply)
                .signAndSend(callerAccount, ({ contract, status }) => {
                    console.log(`wasm contract deploy status: ${status}`);
                    if (status.isFinalized) {
                        unsub();
                        resolve({
                            contractAddress: contract.address.toString(),
                            metadata
                        });
                    }
                });
        } catch (error) {
            reject(error);
        }
    });
}

async function registerWasmContract(api, callerAccount, wasmContractAddress) {
    const unifiedAddress = { WasmVM: wasmContractAddress };

    return new Promise(async (resolve, reject) => {
        try {
            const unsub = await api.tx.hybridVM
                .registContract(unifiedAddress)
                .signAndSend(callerAccount, ({ status, dispatchError }) => {
                    console.log(`wasm contract register status: ${status}`);
                    if (status.isFinalized) {
                        console.log('wasm contract register transaction is finalized');
                        unsub();
                        resolve();
                    }
                });
        } catch (error) {
            reject(error);
        }
    });
}


main().catch(console.error);
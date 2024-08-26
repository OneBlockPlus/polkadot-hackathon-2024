const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const fs = require('fs');

async function main() {
    // connect to local chain
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');
    const api = await ApiPromise.create({ provider: wsProvider });
    const privateKey = '0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133'; // Alith
    const keyring = new Keyring({ type: 'ethereum' });
    const callerAccount = keyring.addFromUri(privateKey, null, 'ethereum');
    console.log(`caller account address: ${callerAccount.address}`);

    // wasm call evm
    // update the contract address to the address of actual contract you've deployed before
    const evmContractAddress = '0x7d4567B7257cf869B01a47E8cf0EDB3814bDb963';
    const wasmContractAddress = '0x10cC5aA5096FBc3CFdE879Bfc26d832f4e4D83c8';
    const transferTo = '0x3Cd0A705a2DC65e5b1E1205896BaA2be8A07c6e0';   // Baltathar
    const amount = 8_000_000_000_000_000_000n;

    // first compiled the wasm contract to metadata, using `cargo contract build`
    const metadataPath = '../hybridvm/external/contract/src/erc20wasm/target/ink/erc20.json';
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const wasmContractInstance = new ContractPromise(api, metadata, wasmContractAddress);
    console.log('wasm contract instance created');
    const gasLimit = api.registry.createType('WeightV2', {
        refTime: 100000n * 1000000n,
        proofSize: 100000n * 1000000n
    });
    await wasmCallEvm(wasmContractInstance, callerAccount, evmContractAddress, transferTo, amount, gasLimit);
    console.log(`Alith has successfully transferred ${amount / BigInt(10 ** 18)} TET (evm token) to Baltathar via wasm contract call`);
    process.exit(0);

}

async function wasmCallEvm(contract, account, evmContractAddress, transferTo, amount, gasLimit) {
    return new Promise((resolve, reject) => {
        contract.tx
            .wasmCallEvm({
                value: 0,
                gasLimit,
            }, evmContractAddress, transferTo, amount)
            .signAndSend(account, result => {
                if (result.status.isInBlock) {
                    console.log('wasmCallEvm in a block');
                } else if (result.status.isFinalized) {
                    console.log(`wasmCallEvm finalized, result: ${JSON.stringify(result)}`);
                    resolve(result);
                } else if (result.isError) {
                    reject(new Error('Transaction failed'));
                }
            }).catch(error => {
            reject(error);
        });
    });
}

main().catch(console.error);
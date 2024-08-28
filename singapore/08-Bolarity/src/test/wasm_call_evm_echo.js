const { ApiPromise, WsProvider, Keyring, HttpProvider} = require('@polkadot/api');
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
    const evmContractAddress = '0xc01Ee7f10EA4aF4673cFff62710E1D7792aBa8f3';
    const wasmContractAddress = '0x9F60F4CF59b74963B03F962949bF9B741fe7Ff81';

    // first compiled the wasm contract to metadata, using `cargo contract build`
    const metadataPath = '../hybridvm/external/contract/src/erc20wasm/target/ink/erc20.json';
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const wasmContractInstance = new ContractPromise(api, metadata, wasmContractAddress);
    console.log('wasm contract instance created');

    // ["test string!","3","231","19","6"]
    let callPara = [
        `{"VM":"evm", "Account":"`,
        `${evmContractAddress}`,
        `","Fun":"echo(string,uint256[])","InputType":["string","uint[]"],"InputValue":["`,
        `test string!","3","231","19","6"],"OutputType":[["string","uint[]"]]}`,
    ].join('');
    console.log('Alith is calling echo method of evm contract via wasm contract, and the input parameters are: \n', callPara);
    const input = api.registry.createType('String', callPara);
    const gasLimit = api.registry.createType('WeightV2', {
        refTime: 100000n * 1000000n,
        proofSize: 100000n * 1000000n
    });
    const { gasRequired, storageDeposit, result, output } = await wasmContractInstance.query.wasmCallEvmProxy(callerAccount.address, {
        storageDepositLimit: null,
        gasLimit,
    }, input);

    console.log("execute result: ", result.toHuman());
    console.log("gas required: ", gasRequired.toHuman());
    if (result.isOk) {
        console.log('Success', output.toHuman());
    } else {
        console.error('Error', result.asErr);
    }
    console.log('Alith has successfully called echo method of evm contract via wasm contract and got the echo result');
    process.exit(0);

}

main().catch(console.error);
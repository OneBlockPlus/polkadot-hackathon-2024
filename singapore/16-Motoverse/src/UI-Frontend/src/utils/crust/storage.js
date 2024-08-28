import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundleForPolkadot, crustTypes } from '@crustio/type-definitions';
// import { Keyring } from '@polkadot/keyring';
// import { KeyringPair } from '@polkadot/keyring/types';
// import { getSigner } from '../polkadotJs/getSigner';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';

// Create global chain instance
const crustChainEndpoint = 'wss://rpc-rocky.crust.network';
const api = new ApiPromise({
    provider: new WsProvider(crustChainEndpoint),
    typesBundle: typesBundleForPolkadot,
});

const placeStorageOrder = async (_cid, _fileSize) =>  {
    // 1. Construct place-storage-order tx
    const fileCid = _cid; // IPFS CID, take `Qm123` as example
    const fileSize = _fileSize // Let's say 2 gb(in byte)
    const tips = 0;
    // If it's a folder, please set memo = 'folder'
    const memo = '';
    const tx = api.tx.market.placeStorageOrder(fileCid, fileSize, tips, memo);

    const extensions = await web3Enable('Motoverse');

    if (extensions.length === 0) {
        // no extension installed, or the user did not accept the authorization
        // in this case we should inform the use and give a link to the extension
        return;
    }
   // 2. Get the account and signer
  const allAccounts = await web3Accounts();
  const account = allAccounts[1]; // Select the correct account
  const injector = await web3FromSource(account.meta.source);
  const signer = injector?.signer;

    // 3. Send transaction
    await api.isReadyOrError;

 const crustStorage = new Promise((resolve, reject) => {
        tx.signAndSend(account.address, { signer }, ({events = [], status}) => {
            console.log(`💸  Tx status: ${status.type}, nonce: ${tx.nonce}`);

            if (status.isInBlock) {
                events.forEach(({event: {method, section}}) => {
                    if (method === 'ExtrinsicSuccess') {
                        console.log(`✅  Place storage order success!`);
                        resolve(true);
                    }
                });
            } else {
                // Pass it
            }
        }).catch(e => {
            reject(e);
        })
    });

    return crustStorage
}

export default placeStorageOrder;
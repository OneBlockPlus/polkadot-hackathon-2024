import { web3FromSource } from '@polkadot/extension-dapp';
import { create } from 'ipfs-http-client'

const  addFileCrust = async (fileContent) => {
    const injector = web3FromSource()
    const sig = await pair.signMessage(pair.address);
    const authHeaderRaw = `eth-${pair.address}:${sig}`;
     // Replace Buffer with browser-compatible base64 encoding
     const authHeader = btoa(authHeaderRaw);
     const ipfsW3GW = 'https://crustipfs.xyz';
    // 1. Create IPFS instant
    const ipfs = create({
        url: `${ipfsW3GW}/api/v0`,
        headers: {
            authorization: `Basic ${authHeader}`
        }
    });

    // 2. Add file to ipfs
    const cid = await ipfs.add(fileContent);

    // 3. Get file status from ipfs
    const fileStat = await ipfs.files.stat("/ipfs/" + cid.path);

    return {
        cid: cid.path,
        size: fileStat.cumulativeSize
    };
}

export default addFileCrust;
import { Configuration, RemotePinningServiceClient } from '@ipfs-shipyard/pinning-service-client';
import { createHelia } from 'helia';
import { createRemotePinner } from '@helia/remote-pinning';
import { Keyring } from '@polkadot/keyring';
import { unixfs } from '@helia/unixfs';
import 'dotenv/config';

const cid = process.env.CID;
const mnemonic = process.env.MNEMONIC;

const getAuthHeaderFromSeed = async (seed) => {
    const keyring = new Keyring();
    const pair = keyring.addFromSeed(seed);
    
    const sig = pair.sign(pair.address);
    const sigHex = '0x' + Buffer.from(sig).toString('hex');
    
    const authHeader = Buffer.from(`sub-${pair.address}:${sigHex}`).toString('base64');
    return authHeader;
}

const getAuthHeaderFromMnemonic = async (mnemonic) => {
    const keyring = new Keyring();
    const pair = keyring.addFromMnemonic(mnemonic);
    const sig = pair.sign(pair.address);
    const sigHex = '0x' + Buffer.from(sig).toString('hex');
    
    const authHeader = Buffer.from(`sub-${pair.address}:${sigHex}`).toString('base64');
    return authHeader;
}

const pinFileWithCrust = async (cid, authHeader) => {
    const helia = await createHelia()
    const pinServiceConfig = new Configuration({
        endpointUrl: `https://pin.crustcode.com/psa/pins`,
        accessToken: `Bearer ${authHeader}` // the secret token/key given to you by your pinning provider
    })
    
    const remotePinningClient = new RemotePinningServiceClient(pinServiceConfig)
    const remotePinner = createRemotePinner(helia, remotePinningClient)
    
    try {
        const heliaFs = unixfs(helia)
        const addPinResult = await remotePinner.addPin({
            cid,
            name: 'helloWorld'
        })
    } catch (e) {
        console.log(e);
    }
}


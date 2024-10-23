
import { ethers } from 'ethers';
import HDWalletProvider from '@truffle/hdwallet-provider'
import PolkaGift from '../contracts/contract/deployments/moonbeam/PolkaGift.json';
import CallPermitABI from '../contracts/contract/artifacts/contracts/precompiles/CallPermit.sol/CallPermit.json';
import config from './json/config.json'
import Web3 from 'web3';

export default async function CallPermit(methodWithSignature) {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const from = (await signer.getAddress())?.toString();
    let signature;
    const to = PolkaGift.address;
    const value = 0;
    const data = await methodWithSignature.encodeABI();

    let transction = { "to": PolkaGift.address, data: data };
    console.log(transction);
    let estimatedGas = await provider.estimateGas(transction)
    const gaslimit = estimatedGas;
    const deadline = Math.round(new Date().getTime() / 1000) + 1500;
    const Call_Permit_address = '0x000000000000000000000000000000000000080a'

    const CallPermitContact = new ethers.Contract(Call_Permit_address, CallPermitABI.abi, signer)


    const nonce = await CallPermitContact.nonces(from);



    // Message to Sign
    const message = {
        from: from,
        to: to,
        value: value,
        data: data,
        gaslimit: gaslimit,
        nonce: nonce,
        deadline: deadline,
    };

    let domain = {
        name: 'Call Permit Precompile',
        version: '1',
        chainId: 1287,
        verifyingContract: '0x000000000000000000000000000000000000080a',
    }
    let types = {

        CallPermit: [
            {
                name: 'from',
                type: 'address',
            },
            {
                name: 'to',
                type: 'address',
            },
            {
                name: 'value',
                type: 'uint256',
            },
            {
                name: 'data',
                type: 'bytes',
            },
            {
                name: 'gaslimit',
                type: 'uint64',
            },
            {
                name: 'nonce',
                type: 'uint256',
            },
            {
                name: 'deadline',
                type: 'uint256',
            },
        ],
    }
    const typedData = ({
        types: types,
        primaryType: 'CallPermit',
        domain: domain,
        message: message,
    });



    const signData = async () => {



        try {
            const rawSig = await signer._signTypedData(domain, types, message);


            signature = ethers.utils.splitSignature(rawSig);

            return ({
                from: from,
                to: to,
                value: value,
                data: data,
                gasLimit: gaslimit,
                deadline: deadline,
                r: signature.r,
                s: signature.s,
                v: signature.v.toString(),
            });

        } catch (err) {
            console.error(err);
        }
    };

    let sig = await signData();

    let providerURL = 'https://rpc.api.moonbase.moonbeam.network';

    // Making Call Permit Dispatch

    let myPrivateKeyHex = config.defaultPrivateKey;

    // Create web3.js middleware that signs transactions locally
    const localKeyProvider = new HDWalletProvider({
        privateKeys: [myPrivateKeyHex],
        providerOrUrl: providerURL,
    });
    const web3 = new Web3(localKeyProvider);

    const myAccount = web3.eth.accounts.privateKeyToAccount(myPrivateKeyHex);

    const CallPermitContract = new web3.eth.Contract(CallPermitABI.abi, Call_Permit_address).methods

    await CallPermitContract.dispatch(from, to, 0, data, gaslimit, deadline, signature.v, signature.r, signature.s.toString()).send({ from: myAccount.address });


}
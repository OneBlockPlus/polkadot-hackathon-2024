import Web3 from 'web3'

import erc721 from '../contracts/contract/deployments/moonbeam/PolkaGift.json';

let providerURL = 'https://moonbase.unitedbloc.com';
export default function ERC721Singleton(signer) {
	let web3;
	if (window.ethereum) web3 = new Web3(window.ethereum)
	else web3 = new Web3(providerURL);
  
	// create an instance of the KeyManager
	const myKM = new web3.eth.Contract(erc721.abi, erc721.address).methods
  
	return myKM
  }
  
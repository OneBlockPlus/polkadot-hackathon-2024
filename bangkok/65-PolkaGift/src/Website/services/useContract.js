import { useState, useEffect } from "react";
import { ethers } from 'ethers';

import ERC721Singleton from './ERC721Singleton';
import erc721 from '../contracts/contract/deployments/moonbeam/PolkaGift.json';

import CallPermit from './CallPermit';

export default function useContract() {
	const [contractInstance, setContractInstance] = useState({
		contract: null,
		signerAddress: null,
		sendTransaction: sendTransaction
	})

	useEffect(() => {
		const fetchData = async () => {
			try {
				if (window.localStorage.getItem("login-type") === "metamask") {
					const provider = new ethers.providers.Web3Provider(window.ethereum);
					const signer = provider.getSigner();
					const contract = { contract: null, signerAddress: null, sendTransaction: sendTransaction };

					contract.contract = ERC721Singleton(signer);
					window.contract = contract.contract;
					window.sendTransaction = sendTransaction;
					window.PolkaGiftAddress = erc721.address;
					contract.signerAddress = await signer.getAddress();

					setContractInstance(contract);
				}
			} catch (error) {
				console.error(error)
			}
		}

		fetchData()
	}, [])


	return contractInstance
}

async function sendTransaction(methodWithSignature) {

	await CallPermit(methodWithSignature);
	return;
}

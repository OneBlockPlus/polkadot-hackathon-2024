import { ethers } from 'ethers';

import erc721 from '../../../contracts/contract/deployments/moonbeam/PolkaGift.json';

export default function ERC721Singleton(signer) {
	if (!ERC721Singleton._instance) {
		ERC721Singleton._instance = new ethers.Contract(
			erc721.address,
			erc721.abi,
			signer
		);
	}

	return ERC721Singleton._instance;
}
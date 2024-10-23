import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import ERC721Singleton from './ERC721SingletonApi';
import config from '../json/config.json';

export default async  function useContract(privateKey) {
    if (privateKey == "") privateKey = config.defaultPrivateKey;
	let contract = null;
	const fetchData = async () => {
		try {
			const provider = new ethers.providers.JsonRpcProvider(config.jsonRPC)

			const signer = new ethers.Wallet(privateKey, provider);

			// Sets a single instance of a specific contract per application
			// Useful for switching across multiple contracts in a single application
			contract = ERC721Singleton(signer);
		} catch (error) {
			console.error(error);
		}
	};

	await fetchData();
	return contract;
}
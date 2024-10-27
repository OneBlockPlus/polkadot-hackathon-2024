
import { ethers } from 'ethers';

import PolkaGift from '../../../contracts/contract/deployments/moonbeam/PolkaGift.json';
import BatchABI from '../../../contracts/contract/artifacts/contracts/precompiles/Batch.sol/Batch.json'

import ERC721Singleton from './ERC721SingletonApi';
import config from '../../json/config.json';

export async function useContract(privateKey) {
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


const m_prefix = "m_";
export async function fetchMoonEventData() {
	let output;
	const contract = await useContract("");

	if (contract) {
		let totalEvent = Number(await contract.totalEvent());
		const arr = [];
		for (let i = 0; i < Number(totalEvent); i++) {

			const valueAll = await contract.eventURI(i);
			const value = valueAll[1];

			if (value) {
				const object = JSON.parse(value);
				var c = new Date(object.properties.Date.description).getTime();
				var n = new Date().getTime();
				var d = c - n;
				var s = Math.floor((d % (1000 * 60)) / 1000);
				if (s.toString().includes("-")) {
					continue;
				}


				arr.push({
					eventId: m_prefix + i,
					Title: object.properties.Title.description,
					Date: object.properties.Date.description,
					Goal: object.properties.Goal.description,
					logo: object.properties.logo.description,
					allfiles: object.properties.allFiles
				});
			}
		}
		output = arr
	}
	return output;
}


export async function getAllNftsMoonEventId(id) {
	const contract = await useContract("");
	if (contract) {
		const arr = [];
		const totalTokens = await contract.gettokenSearchEventTotal(id);
		for (let i = 0; i < Number(10); i++) {
			const obj = await totalTokens[i];

			let object = {};
			try { object = await JSON.parse(obj) } catch { }
			if (object.title) {
				const TokenId = Number(await contract.gettokenIdByUri(obj));

				arr.push({
					Id: m_prefix + TokenId,
					name: object.properties.name.description,
					description: object.properties.description.description,
					price: Number(object.properties.price.description),
					type: object.properties.typeimg.description,
					image: object.properties.image.description,
				});
			}

		}

		return arr;
	}
	return [];
}


export async function BidNftMoon(contract,tokenId, privatekey,highestPrice,biddingPrice) {
	let output = [];
	try {

		let to = [];
		let value = [];
		let callData = [];
		let gasLimit = [];

		const provider = new ethers.providers.JsonRpcProvider(config.jsonRPC)

		const targetSigner = new ethers.Wallet(privatekey, provider);
		let senderAddress = await targetSigner.getAddress();

		const tokenUri = await contract.tokenURI(tokenId);
		var parsed = await JSON.parse(tokenUri);
		let eventId = (parsed.properties.eventID);


		//Transfer
		if (biddingPrice < Number(highestPrice)) {
			output = JSON.stringify({
				status: "error",
				message: `The bid price is lower than ${highestPrice}!`
			})
			console.log(output);
			return;
		}

		//Adding Sending amount to Batch paramaters:

		to.push(parsed.properties.wallet.description);
		value.push(`${Number(biddingPrice) * 1e18}`)
		callData.push("0x");




		let currentDate = new Date();
		const createdObject = {
			title: 'Asset Metadata Bids',
			type: 'object',
			properties: {
				username: {
					type: 'string',
					description: senderAddress
				},
				bid: {
					type: 'string',
					description: biddingPrice
				},
				time: {
					type: 'string',
					description: currentDate
				}
			}
		};
		const totalraised = await contract.getEventRaised((eventId));
		let Raised = 0;
		Raised = Number(totalraised) + Number(biddingPrice);

		to.push(PolkaGift.address);
		value.push(0);
		callData.push((await contract.populateTransaction.createBid(tokenId, JSON.stringify(createdObject),  eventId, Raised.toString(),(Amount).toString())).data)

		let batchAdd = "0x0000000000000000000000000000000000000808";

		let BatchContract = new ethers.Contract(batchAdd, BatchABI.abi, targetSigner);

		await (await BatchContract.batchAll(to, value, callData, gasLimit)).wait(1);

		output = ({
			status: "success",
			message: `Bid successful`
		})
	} catch (error) {
		output = {
			status: "error",
			from: "Full Error",
			message: error.message,

		};
	}
}


export async function GetHighestBidMoon(contract,id) {
	if (contract) {
		const BidId = Number(await contract.getTokenHighestBid(id).call());
		if (BidId !== -1) {
			let highestBidInfo = await contract.TokenHighestBidders(BidId).call();
			return Number(highestBidInfo.price);
		}
		return -1;

	}
}

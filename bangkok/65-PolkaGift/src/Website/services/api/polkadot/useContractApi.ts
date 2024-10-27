import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { options } from "@astar-network/astar-api";
import config from '../../json/config.json'

import getContract from "./getContract";
export async function useContract(Mnemonic) {
	if (Mnemonic == "") Mnemonic = config.defaultMnemonicPolkadot;
	let contractInstance = {
		api: null,
		contract: null,
		signerAddress: null,
		signerPair: null,
		sendTransaction: sendTransaction,
		ReadContractByQuery: ReadContractByQuery,
		getMessage: getMessage,
		getQuery: getQuery,
		getTX: getTX,
		ParseBigNum: ParseBigNum,
		currentChain: null
	};

	const WS_PROVIDER = "wss://rpc.shibuya.astar.network"; // shibuya

	try {
		const provider = new WsProvider(WS_PROVIDER);
		const api = new ApiPromise(options({ provider }));

		await api.isReady;
		const keyring = new Keyring({ type: 'sr25519', ss58Format: 2 });

		const pair = keyring.addFromMnemonic(Mnemonic)

		contractInstance.signerPair = pair as any;

		contractInstance.api = api as any;

		contractInstance.contract = await getContract(api) as any;

		contractInstance.signerAddress = pair.address as any;
		console.log("user => " + contractInstance.signerAddress)

	} catch (error) {
		console.error(error);
	}

	return contractInstance;
}



const p_prefix = "p_";
export async function fetchPolkaEventData() {
	const { api, signerAddress, contract } = await useContract("");

	if (contract != null) {
		try {
			const totalEvents = await ReadContractByQuery(api, signerAddress, getQuery(contract, "totalEvent"))

			let arr = [];
			for (let i = 0; i < Number(totalEvents); i++) {
				try {
					let event_element = await ReadContractByQuery(api, signerAddress, getQuery(contract, "_eventURI"), [p_prefix + i])
					const value = event_element[1];

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
							eventId: p_prefix + i,
							Title: object.properties.Title.description,
							Date: object.properties.Date.description,
							Goal: object.properties.Goal.description,
							logo: object.properties.logo.description.url,
							allfiles: object.properties.allFiles

						});
					}
				} catch (e) {
				}
			}
			return arr;

		} catch (e) {
		}
	}
	return [];
}

export async function getNftsPolkaEventID(id) {
	const { api, signerAddress, contract } = await useContract("");
	if (contract) {
		let event_tokens = await ReadContractByQuery(api, signerAddress, getQuery(contract, "gettokenSearchEventTotal"), [id])
		const arr = [];

		for (let i = 0; i < event_tokens.length; i++) {
			const obj = event_tokens[i];

			let object = { title: "", properties: { name: { description: "" } ,description: { description: "" },price: { description: "" },typeimg: { description: "" } ,image: { description: "" } } };
			try { object = await JSON.parse(obj) } catch { }
			if (object.title) {
				let TokenId = await ReadContractByQuery(api, signerAddress, getQuery(contract, "gettokenIdByUri"), [obj])

				arr.push({
					Id: TokenId.toString(),
					eventId: id.toString(),
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



export async function GetHighestBidPolka(api, signerAddress,contract,id){
	if (contract) {
		const BidId = Number(await ReadContractByQuery(api, signerAddress,getQuery(contract,"getTokenHighestBid"), [id]) );
		if (BidId !== -1){
			let highestBidInfo = await ReadContractByQuery(api, signerAddress,getQuery(contract,"TokenHighestBidder"), [BidId]);
			return Number(highestBidInfo.price);
		}
		return -1;

	}
}

export async function BidNftPolka(api, signerAddress,contract,event_raised,toAddress,Amount){

	await SendMoney(api, signerAddress,toAddress,`${Number(Amount) * 1e18}`);

	const Raised = Number(event_raised) + Number(Amount);


}





async function SendMoney(api,signerAddress,to,price) {
	const sendTX = new Promise(function executor(resolve) {
	   
		api.tx.balances.transfer(to, price).signAndSend(signerAddress, async (res) => {
			if (res.status.isInBlock) {
				// console.log("in a block");
				resolve("OK");
			} else if (res.status.isFinalized) {
				console.log("finalized");
				resolve("OK");
			}
		});

			
	});
	await sendTX;

}
const ParseBigNum = (num) => Number(num.replaceAll(",", "")) / 1e18
async function sendTransaction(api, contract, signerAddress, method, args = null, finalized = false) {
	let tx = getTX(contract, method);
	let query = getQuery(contract, method);
	let gasLimit;
	if (args) {
		const { gasRequired, result, output } = await query(
			signerAddress,
			{
				gasLimit: api.registry.createType("WeightV2", api.consts.system.blockWeights['maxBlock']),
			},
			...args as any
		);
		gasLimit = api.registry.createType("WeightV2", gasRequired);
	} else {
		const { gasRequired, result, output } = await query(signerAddress, {
			gasLimit: api.registry.createType("WeightV2", api.consts.system.blockWeights['maxBlock']),
		});
		gasLimit = api.registry.createType("WeightV2", gasRequired);
	}

	const keyring = new Keyring({ type: 'sr25519', ss58Format: 2 });

	const pair = keyring.addFromMnemonic('bottom drive obey lake curtain smoke basket hold race lonely fit walk')

	const sendTX = new Promise(function executor(resolve) {
		tx({
			gasLimit: gasLimit
		},
			...args as any)
			.signAndSend(pair, async (res) => {
				if (res.status.isInBlock) {
					console.log("in a block");
					if (!finalized) resolve("OK");
				} else if (res.status.isFinalized) {

					console.log("finalized");
					resolve("OK");
				}
			});
	});
	await sendTX;

}

async function ReadContractByQuery(api, signerAddress, query, args = null) {

	if (args) {
		const { gasRequired, result, output } = await query(
			signerAddress,
			{
				gasLimit: api.registry.createType("WeightV2", api.consts.system.blockWeights['maxBlock']),

				storageDepositLimit: null
			},
			...args as any
		);
		if (output) {
			return output.toHuman().Ok;
		} else {
			return null;
		}
	} else {
		const { gasRequired, result, output } = await query(signerAddress, {
			gasLimit: api.registry.createType("WeightV2", api.consts.system.blockWeights['maxBlock']),
			storageDepositLimit: null
		});
		if (output) {
			return output.toHuman().Ok;
		} else {
			return null;
		}
	}
}
function getMessage(contract, find_contract) {

	for (let i = 0; i < contract.abi.messages.length; i++) {
		if (find_contract == contract.abi.messages[i]["identifier"]) {
			return contract.abi.messages[i];
		}
	}
}

function getQuery(contract, find_contract) {

	let messageName = "";
	for (let i = 0; i < contract.abi.messages.length; i++) {
		if (find_contract == contract.abi.messages[i]["identifier"]) {
			messageName = contract.abi.messages[i]["method"];

			return contract.query[messageName];
		}
	}
}
function getTX(contract, find_contract) {
	let messageName = "";
	for (let i = 0; i < contract.abi.messages.length; i++) {
		if (find_contract == contract.abi.messages[i]["identifier"]) {
			messageName = contract.abi.messages[i]["method"];
			return contract.tx[messageName];
		}
	}
}

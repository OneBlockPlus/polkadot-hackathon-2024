import {ApiPromise, Keyring, WsProvider} from "@polkadot/api";
import {options} from "@astar-network/astar-api";
import {Buffer} from "buffer";

import getContract from "./getContract";
export default async function useContract() {
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
		currentChain: null
	};
	const WS_PROVIDER = "wss://shibuya-rpc.dwellir.com"; // shibuya


	try {
		const provider = new WsProvider(WS_PROVIDER);
		const api = new ApiPromise(options({provider}));
		
		await api.isReady;
		const keyring = new Keyring({ type: 'sr25519', ss58Format: 2 });

		const pair = keyring.addFromMnemonic('bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice')

		contractInstance.signerPair = pair as any;

		contractInstance.api = api as any;

		contractInstance.contract = await getContract(api) as any;

		contractInstance.signerAddress = pair.address as any;
	} catch (error) {
		console.error(error);
	}
	
	return contractInstance;
}


async function sendTransaction(api,contract, signerAddress, method, args = null) {
	let tx = getTX(contract,method);
	let query  = getQuery(contract,method);
	let gasLimit;
	if (args) {
		const {gasRequired, result, output} = await query(
			signerAddress,
			{
				gasLimit: api.registry.createType("WeightV2", {
					refTime: 6219235328,
					proofSize: 131072
				}),
				storageDepositLimit: null
			},
			...args as any
		);
		gasLimit = api.registry.createType("WeightV2", gasRequired);
	} else {
		const {gasRequired, result, output} = await query(signerAddress, {
			gasLimit: api.registry.createType("WeightV2", {
				refTime: 6219235328,
				proofSize: 131072
			}),
			storageDepositLimit: null
		});
		gasLimit = api.registry.createType("WeightV2", gasRequired);
	}
	
	const keyring = new Keyring({ type: 'sr25519', ss58Format: 2 });

	const pair = keyring.addFromMnemonic('bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice')

	const sendTX =	new Promise(function executor(resolve) {
		 tx({
				gasLimit: gasLimit,
				storageDepositLimit: null
			},
			...args as any)
			.signAndSend(pair, async (res) => {
				if (res.status.isInBlock) {
					console.log("in a block");
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
		const {gasRequired, result, output} = await query(
			signerAddress,
			{
				gasLimit: api.registry.createType("WeightV2", {
					refTime: 6219235328,
					proofSize: 131072
				}),
				storageDepositLimit: null
			},
			...args as any
		);
		if (output){
			return output.toHuman().Ok;
		}else{
			return null;
		}
	} else {
		const {gasRequired, result, output} = await query(signerAddress, {
			gasLimit: api.registry.createType("WeightV2", {
				refTime: 6219235328,
				proofSize: 131072
			}),
			storageDepositLimit: null
		});
		if (output){
			return output.toHuman().Ok;
		}else{
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

function getQuery(contract,find_contract) {
	let messageName = "";
	for (let i = 0; i < contract.abi.messages.length; i++) {
		if (find_contract == contract.abi.messages[i]["identifier"]) {
			messageName = contract.abi.messages[i]["method"];
			return contract.query[messageName];
		}
	}
}
function getTX(contract,find_contract) {
	let messageName = "";
	for (let i = 0; i < contract.abi.messages.length; i++) {
		if (find_contract == contract.abi.messages[i]["identifier"]) {
			messageName = contract.abi.messages[i]["method"];
			return contract.tx[messageName];
		}
	}
}

export function base64DecodeUnicode(base64String) {
	return Buffer.from(base64String, "base64").toString('utf8');
}

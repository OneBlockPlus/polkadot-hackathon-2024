import { useState, useEffect } from "react";

import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { options } from "@astar-network/astar-api";
import { getDecodedOutput } from "./helpers";

import getContract from "./getContract";
import { web3Enable, isWeb3Injected, web3Accounts } from "@polkadot/extension-dapp";



const WS_PROVIDER = "wss://rpc.shibuya.astar.network"; // shibuya
const CONTRACT_ADDRESS = "YPh92B2p659spnB4ASZqkiz8gFiwdDoT7g8gGWxkMXsUcgJ"
export default function useContract() {
	const [contractInstance, setContractInstance] = useState({
		api: null,
		contract: null,
		signerAddress: null,
		sendTransaction: sendTransaction,
		ReadContractValue: ReadContractValue,
		ReadContractByQuery: ReadContractByQuery,
		getMessage: getMessage,
		getQuery: getQuery,
		getTX: getTX,
		currentChain: null
	});


	useEffect(() => {
		const fetchData = async () => {
			if (window.localStorage.getItem("type") === "polkadot") {
				try {
					const provider = new WsProvider(WS_PROVIDER);
					const api = new ApiPromise(options({ provider }));

					await api.isReady;
					const extension = await web3Enable("WaveData");
					const injectedAccounts = await web3Accounts();

					api.setSigner(extension[0].signer)
					const contract = {
						api: null,
						contract: null,
						signerAddress: null,
						sendTransaction: sendTransaction,
						ReadContractValue: ReadContractValue,
						ReadContractByQuery: ReadContractByQuery,
						getMessage: getMessage,
						getQuery: getQuery,
						getTX: getTX,
						currentChain: null
					};
					contract.api = api;

					contract.contract = await getContract(api);

					contract.signerAddress = injectedAccounts[0].address;
					window.AddressPolkadot = injectedAccounts[0].address;
					window.contract = contract.contract;
					setContractInstance(contract);
				} catch (error) {
					console.error(error);
				}
			}
		};

		fetchData();
	}, []);


	async function sendTransaction(api, signerAddress, method, args = []) {
		let tx = getTX(method);
		let query = getQuery(method);
		let gasLimit;
		if (args.length > 0) {
			const { gasRequired, result, output } = await query(
				signerAddress,
				{
					gasLimit: api.registry.createType("WeightV2", api.consts.system.blockWeights['maxBlock']),
				},
				...args
			);
			gasLimit = api.registry.createType("WeightV2", gasRequired);
		} else {
			const { gasRequired, result, output } = await query(signerAddress, {
				gasLimit: api.registry.createType("WeightV2", api.consts.system.blockWeights['maxBlock']),
			});
			gasLimit = api.registry.createType("WeightV2", gasRequired);
		}

		const sendTX = new Promise(function executor(resolve) {
			tx({
				gasLimit: gasLimit
			},
				...args)
				.signAndSend(signerAddress, async (res) => {
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

	async function ReadContractValue(api, signerAddress, msg, msgWithArgs) {
		const result = await api.call.contractsApi.call(signerAddress, CONTRACT_ADDRESS, 0, null, null, msg.toU8a(msgWithArgs));

		const decodedOutput = getDecodedOutput(result, msg, api.registry).decodedOutput;

		return decodedOutput;
	}

	async function ReadContractByQuery(api, signerAddress, query, args = null) {
		if (args) {
			const { gasRequired, result, output } = await query(
				signerAddress,
				{
					gasLimit: api.registry.createType("WeightV2", api.consts.system.blockWeights['maxBlock']),
					storageDepositLimit: null
				},
				...args
			);
			return output.toHuman().Ok;
		} else {
			const { gasRequired, result, output } = await query(signerAddress, {
				gasLimit: api.registry.createType("WeightV2", api.consts.system.blockWeights['maxBlock']),
				storageDepositLimit: null
			});
			return output.toHuman().Ok;
		}
	}
	function getMessage(find_contract) {
		for (let i = 0; i < window.contract.abi.messages.length; i++) {
			if (find_contract == window.contract.abi.messages[i]["identifier"]) {
				return window.contract.abi.messages[i];
			}
		}
	}

	function getQuery(find_contract) {
		let messageName = "";
		for (let i = 0; i < window.contract.abi.messages.length; i++) {
			if (find_contract == window.contract.abi.messages[i]["identifier"]) {
				messageName = window.contract.abi.messages[i]["method"];
				return window.contract.query[messageName];
			}
		}
	}
	function getTX(find_contract) {
		let messageName = "";
		for (let i = 0; i < window.contract.abi.messages.length; i++) {
			if (find_contract == window.contract.abi.messages[i]["identifier"]) {
				messageName = window.contract.abi.messages[i]["method"];
				return window.contract.tx[messageName];
			}
		}
	}

	return contractInstance;
}

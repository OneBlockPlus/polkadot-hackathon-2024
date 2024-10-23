'use client';
import {useState, useEffect, useContext} from "react";

import {ApiPromise, Keyring, WsProvider} from "@polkadot/api";
import {options} from "@astar-network/astar-api";
import {getDecodedOutput} from "../services/helpers/output.ts";

import getContract from "../services/getContract";
import {web3Enable, isWeb3Injected, web3Accounts} from "@polkadot/extension-dapp";


import {createContext} from 'react';

const WS_PROVIDER = "wss://rpc.shibuya.astar.network"; // shibuya
const CONTRACT_ADDRESS = "bfu6bVbZ3HezegPEJFuHYssWAA5UxvoyQkiG1bNBrARmTpP"

const AppContext = createContext({
    api: null,
    contract: null,
    signerAddress: null,
    loadingContract: true,
    sendTransaction: (api, signerAddress, method, args = [], value = 0) => {
    },
    ReadContractValue: (api, signerAddress, msg, msgWithArgs) => {
    },
    ReadContractByQuery: (api, signerAddress, query, args = null) => {
    },
    getMessage: (find_contract) => {
    },
    getQuery: (find_contract) => {
    },
    getTX: (find_contract) => {
    },
});


export function PolkadotProvider({children}) {

    const [api, setApi] = useState(null);
    const [contract, setContract] = useState(null);
    const [signerAddress, setSignerAddress] = useState(null);
    const [loadingContract, setLoadingContract] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (window.localStorage.getItem("type") === "polkadot") {
                try {
                    const provider = new WsProvider(WS_PROVIDER);
                    const _api = new ApiPromise(options({provider}));

                    await _api.isReady;
                    const extension = await web3Enable("YT Purchase");
                    const injectedAccounts = await web3Accounts();

                    _api.setSigner(extension[0].signer)
                    setApi(_api);


                    let _contract = await getContract(_api);
                    setContract(_contract);

                    setSignerAddress(injectedAccounts[0].address);
                    window.AddressPolkadot = injectedAccounts[0].address;
                    window.contract = _contract;

                    setLoadingContract(false)
                } catch (error) {
                    console.error(error);
                }
            } else {
                setLoadingContract(false);
            }
        };

        fetchData();
    }, []);


    async function sendTransaction(api, signerAddress, method, args = [], value = 0) {
        let tx = getTX(method);
        let query = getQuery(method);
        let gasLimit;
        if (args.length > 0) {
            const {gasRequired, result, output} = await query(
                signerAddress,
                {
                    gasLimit: api.registry.createType("WeightV2", api.consts.system.blockWeights['maxBlock']),
                },
                ...args
            );
            gasLimit = api.registry.createType("WeightV2", gasRequired);
        } else {
            const {gasRequired, result, output} = await query(signerAddress, {
                gasLimit: api.registry.createType("WeightV2", api.consts.system.blockWeights['maxBlock']),
            });
            gasLimit = api.registry.createType("WeightV2", gasRequired);
        }
        console.log(gasLimit);
        const sendTX = new Promise(function executor(resolve) {
            tx({
                    gasLimit: gasLimit,
                    value: value
                },
                ...args)
                .signAndSend(signerAddress, async (res) => {
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

    async function ReadContractValue(api, signerAddress, msg, msgWithArgs) {
        const result = await api.call.contractsApi.call(signerAddress, CONTRACT_ADDRESS, 0, null, null, msg.toU8a(msgWithArgs));

        const decodedOutput = getDecodedOutput(result, msg, api.registry).decodedOutput;

        return decodedOutput;
    }

    async function ReadContractByQuery(api, signerAddress, query, args = null) {
        if (api === null) return;
        if (args) {
            const {gasRequired, result, output} = await query(
                signerAddress,
                {
                    gasLimit: api.registry.createType("WeightV2", api.consts.system.blockWeights['maxBlock']),
                    storageDepositLimit: null
                },
                ...args
            );
            if (output != null)
                return output.toHuman().Ok;
        } else {
            const {gasRequired, result, output} = await query(signerAddress, {
                gasLimit: api.registry.createType("WeightV2", api.consts.system.blockWeights['maxBlock']),
                storageDepositLimit: null
            });
            if (output != null)
                return output.toHuman().Ok;
        }
        return 0;
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

    return <AppContext.Provider value={{
        api,
        contract,
        signerAddress,
        loadingContract,
        sendTransaction: sendTransaction,
        ReadContractValue: ReadContractValue,
        ReadContractByQuery: ReadContractByQuery,
        getMessage: getMessage,
        getQuery: getQuery,
        getTX: getTX,
    }}>{children}</AppContext.Provider>;

}

export const usePolkadotContext = () => useContext(AppContext);

window.ParseBigNum = (num) => Number(num.toString().replaceAll(",", "")) / 1e18

window.WrapBigNum = (num) => (Number(num.toString().replaceAll(",", "")) * 1e18).toFixed(0)

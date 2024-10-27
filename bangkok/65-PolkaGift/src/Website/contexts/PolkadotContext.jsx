'use client';
import { useState, useEffect, useContext } from "react";

import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { getDecodedOutput } from "./services/helpers/output.ts";

import getContract from "./services/getContract";

import config from './json/config.json';

import { createContext } from 'react';

const WS_PROVIDER = "wss://rpc.shibuya.astar.network"; // shibuya
const CONTRACT_ADDRESS = config.AstarSmartContract

const p_prefix = "p_";
const AppContext = createContext({
    polka_api: null,
    polka_contract: null,
    polka_signerAddress: null,
    polka_loadingContract: true,
    polka_sendTransaction: async (method, argument = [], value = 0) => { },
    polka_ReadContractValue: (msg, msgWithargument) => { },
    polka_ReadContractByQuery: (query, argument = null) => { },
    polka_getMessage: (find_contract) => { },
    polka_getQuery: (find_contract) => { },
    polka_getTX: (find_contract) => { },
    polka_ParseBigNum: (num) => { },
    polka_WrapBigNum: (num) => { },
    polka_GetPolkadotEvents: () => [],
    polka_GetAllEventTokens: async (id) => [],
    polka_GetPolkadotEventUri: async (id) => [],
    polka_GetPolkadotTokenUri: async (id) => [],
    polka_GetNftBidsByTokenId: async (id) => [],
    polka_GetPolkadotTotalEvent: async () => 0,
    polka_GetPolkadotEventRaised: async (id) => 0,
    polka_GetHighestBid: async (id) => 0,
    polka_GetEventEnded: async (id) => false,
    polka_SendMoney: async (to,price) => {},
});


export function PolkadotProvider({ children }) {

    const [api, setApi] = useState(null);
    const [contract, setContract] = useState(null);
    const [signerAddress, setSignerAddress] = useState(null);
    const [loadingContract, setLoadingContract] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const provider = new WsProvider(WS_PROVIDER);



            if (window.localStorage.getItem("login-type") === "polkadot") {
                try {

                    const { web3Enable, isWeb3Injected, web3Accounts } = await import("@polkadot/extension-dapp");

                    const extension = await web3Enable("PolkaGift");
                    const injectedAccounts = await web3Accounts();


                    const _api = await ApiPromise.create({ provider });
                    await _api.isReady;
                    _api.setSigner(extension[0].signer)
                    setApi(_api);
                    let _contract = await getContract(_api);
                    setContract(_contract);
                    window.contract = _contract;


                    setSignerAddress(injectedAccounts[0].address);
                    window.AddressPolkadot = injectedAccounts[0].address;


                    setLoadingContract(false)
                } catch (error) {
                    console.error(error);
                }
            } else {
                const _api = await ApiPromise.create({ provider });
                await _api.isReady;
                setApi(_api);
                let _contract = await getContract(_api);
                setContract(_contract);
                window.contract = _contract;

                setLoadingContract(false);
            }
        };

        fetchData();
    }, []);


    async function sendTransaction(method, argument = [], value = 0) {
        let tx = getTX(method);
        let query = getQuery(method);
        let gasLimit;
        if (argument.length > 0) {
            const { gasRequired, result, output } = await query(
                signerAddress,
                {
                    gasLimit: api.registry.createType("WeightV2", api.consts.system.blockWeights['maxBlock']),
                },
                ...argument
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
                gasLimit: gasLimit,
                value: value
            },
                ...argument)
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

    async function ReadContractValue(msg, msgWithargument) {
        const result = await api.call.contractsApi.call(signerAddress, CONTRACT_ADDRESS, 0, null, null, msg.toU8a(msgWithargument));

        const decodedOutput = getDecodedOutput(result, msg, api.registry).decodedOutput;

        return decodedOutput;
    }

    async function ReadContractByQuery(query, argument = null) {
        if (api === null) return;
        if (argument) {
            const { gasRequired, result, output } = await query(
                signerAddress,
                {
                    gasLimit: api.registry.createType("WeightV2", api.consts.system.blockWeights['maxBlock']),
                    storageDepositLimit: null
                },
                ...argument
            );
            if (output != null)
                return output.toHuman().Ok;
        } else {
            const { gasRequired, result, output } = await query(signerAddress, {
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
        for (let i = 0; i < contract.abi.messages.length; i++) {
            if (find_contract == contract.abi.messages[i]["identifier"]) {
                messageName = contract.abi.messages[i]["method"];
                return contract.query[messageName];
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


    async function GetAllEventTokens(id) {
        if (contract) {
            let event_tokens = await ReadContractByQuery(getQuery("gettokenSearchEventTotal"), [id])

            const arr = [];

            for (let i = 0; i < event_tokens.length; i++) {
                const obj = event_tokens[i];

                let object = {};
                try { object = await JSON.parse(obj) } catch { }
                if (object.title) {
                    let TokenId = await ReadContractByQuery(getQuery("gettokenIdByUri"), [obj])

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


    async function GetEventEnded(id){
        if (contract) {
           return  (await ReadContractByQuery(getQuery("_AllEventEnded"), [id]) );
        }
    }
    

    async function GetHighestBid(id){
        if (contract) {
            const BidId = Number(await ReadContractByQuery(getQuery("getTokenHighestBid"), [id]) );
            if (BidId !== -1){
                let highestBidInfo = await ReadContractByQuery(getQuery("TokenHighestBidder"), [BidId]);
                return Number(highestBidInfo.price);
            }
            return -1;

        }
    }

    async function GetPolkadotEventUri(id) {
        if (contract != null) {
            let event_element = await ReadContractByQuery(getQuery("_eventURI"), [id])
            return event_element;
        }
        return [];
    }
    async function GetPolkadotTokenUri(id) {
        if (contract != null) {
            let token_element = await ReadContractByQuery(getQuery("_tokenURI"), [id])
            return token_element;
        }
        return [];
    }
    async function GetPolkadotEvents() {

        if (contract != null) {
            try {
                const totalEvents = await ReadContractByQuery(getQuery("totalEvent"))

                let arr = [];
                for (let i = 0; i < Number(totalEvents); i++) {
                    try {
                        let event_element = await ReadContractByQuery(getQuery("_eventURI"), [p_prefix + i])
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
                                wallet: object.properties.wallet.description,
                                logo: object.properties.logo.description.url,
                                
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


    async function GetPolkadotTotalEvent() {
        if (contract) {

            const totalEvents = await ReadContractByQuery(getQuery("totalEvent"))

            return Number(totalEvents);

        }
        return 0;
    }

    async function GetPolkadotEventRaised(id) {
        if (contract) {

            const totalEventRaised = await ReadContractByQuery(getQuery("_eventRaised"), [id])

            return Number(totalEventRaised);

        }
        return 0;
    }
	function addZero(num) {
		return num < 10 ? `0${num}` : num;
	}
	function AmPM(num) {
		return num < 12 ? 'AM' : 'PM';
	}
	const formatter = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

    async function GetNftBidsByTokenId(id) {
        const arr = [];
        if (contract && id) {
            const totalBids = await ReadContractByQuery(getQuery("getTotalBid"), [id])

            for (let i = 0; i < totalBids.length; i++) {
                const obj = await totalBids[i];
                let object = {};
                try { object = await JSON.parse(obj) } catch { }
                if (object.title) {

                    const BidId = await ReadContractByQuery(getQuery("getBidIdByUri"), [obj])

                    const Datetime = new Date(object.properties.time.description);

                    let currentdate = `${addZero(Datetime.getDate())}/${addZero(Datetime.getMonth() + 1)}/${addZero(Datetime.getFullYear())} ${addZero(Datetime.getHours())}:${addZero(Datetime.getMinutes())}:${addZero(Datetime.getSeconds())} ${AmPM(Datetime.getHours())}`
                    arr.push({
                        Id: BidId,
                        name: object.properties.username.description.toString(),
                        time: currentdate,
                        bidprice: object.properties.bid.description,
                    });
                }
            }

        }
        return arr;
    }

    async function SendMoney(to,price) {
        const sendTX = new Promise(function executor(resolve) {
           
            api.tx.balances.transferAllowDeath(to, price).signAndSend(signerAddress, async (res) => {
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
    const ParseBigNum = (num) => Number(num.toString().replaceAll(",", "")) / 1e18;
    const WrapBigNum = (num) => (Number(num.toString().replaceAll(",", "")) * 1e18).toFixed(0);

    return <AppContext.Provider value={{
        polka_api: api,
        polka_contract: contract,
        polka_signerAddress: signerAddress,
        polka_loadingContract: loadingContract,
        polka_sendTransaction: sendTransaction,
        polka_ReadContractValue: ReadContractValue,
        polka_ReadContractByQuery: ReadContractByQuery,
        polka_getMessage: getMessage,
        polka_getQuery: getQuery,
        polka_getTX: getTX,
        polka_ParseBigNum: ParseBigNum,
        polka_WrapBigNum: WrapBigNum,
        polka_GetPolkadotEventUri: GetPolkadotEventUri,
        polka_GetPolkadotTokenUri: GetPolkadotTokenUri,
        polka_GetPolkadotEvents: GetPolkadotEvents,
        polka_GetAllEventTokens: GetAllEventTokens,
        polka_GetPolkadotTotalEvent: GetPolkadotTotalEvent,
        polka_GetNftBidsByTokenId: GetNftBidsByTokenId,
        polka_GetPolkadotEventRaised: GetPolkadotEventRaised,
        polka_GetHighestBid: GetHighestBid,
        polka_GetEventEnded: GetEventEnded,
        polka_SendMoney:SendMoney,
    }}>{children}</AppContext.Provider>;

}

export const usePolkadotContext = () => useContext(AppContext);

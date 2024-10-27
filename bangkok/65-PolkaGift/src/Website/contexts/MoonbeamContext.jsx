'use client';
import { useState, useEffect, useContext } from "react";
import { ethers } from 'ethers';

import ERC721Singleton from '../services/ERC721Singleton';
import erc721 from '../contracts/contract/deployments/moonbeam/PolkaGift.json';

import CallPermit from '../services/CallPermit';

import { createContext } from 'react';


const m_prefix = "m_";
const AppContext = createContext({
    moon_api: null,
    moon_contract: null,
    moon_signerAddress: null,
    moon_loadingContract: true,
    moon_sendTransaction: async (method, argument = [], value = 0) => { },
    moon_ReadContractValue: (msg, msgWithArgs) => { },
    moon_ReadContractByQuery: (query, argument = null) => { },
    moon_getMessage: (find_contract) => { },
    moon_getQuery: (find_contract) => { },
    moon_getTX: (find_contract) => { },
    moon_ParseBigNum: (num) => { },
    moon_WrapBigNum: (num) => { },
    moon_GetMoonbeamEvents: async () => [],
    moon_GetMoonbeamEventUri: async (id) => [],
    moon_GetMoonbeamTokenUri: async (id) => [],
    moon_GetNftBidsByTokenId: async (id) => [],
    moon_GetAllEventTokens: async (id) => [],
    moon_GetMoonbeamTotalEvent: async () => 0,
    moon_GetMoonbeamEventRaised: async (id) => 0,
    moon_GetHighestBid: async (id) => 0,
    moon_GetEventEnded: async (id) => false,
});


export function MoonbeamProvider({ children }) {

    const [api, setApi] = useState(null);
    const [contract, setContract] = useState(null);
    const [signerAddress, setSignerAddress] = useState(null);
    const [loadingContract, setLoadingContract] = useState(true);

    useEffect(() => {
        const fetchData = async () => {

            let _contract = ERC721Singleton(null);
            setContract(_contract);

            window.contract = _contract;

            window.PolkaGiftAddress = erc721.address;
            setApi(false);

            if (window.localStorage.getItem("login-type") === "metamask") {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    setSignerAddress(await signer.getAddress());
                } catch (error) {
                    console.error(error);
                }
            } else {

                setLoadingContract(false);
            }
        };

        fetchData();
    }, []);


    async function sendTransaction(method, argument = [], value = 0) {
        let methodWithSignature = await contract[method](...argument)

        await CallPermit(methodWithSignature);
        return;
    }

    async function ReadContractValue(msg, msgWithArgs) {

    }

    async function ReadContractByQuery(query, argument = null) {

    }
    function getMessage(find_contract) {

    }

    function getQuery(find_contract) {

    }
    function getTX(find_contract) {

    }

    async function GetHighestBid(id){
        if (contract) {
            const BidId = Number(await contract.getTokenHighestBid(id).call());
            if (BidId !== -1){
                let highestBidInfo = await contract.TokenHighestBidders(BidId).call();
                return Number(highestBidInfo.price);
            }
            return -1;

        }
    }
    async function GetEventEnded(id){
        if (contract) {
            try{
                return await contract.AllEventEnded(id).call();
            }catch(e){return false}
        }
    }
    async function GetAllEventTokens(id) {
        if (contract) {
            const arr = [];

            const totalTokens = await contract.gettokenSearchEventTotal(id).call();

            for (let i = 0; i < Number(10); i++) {
                const obj = await totalTokens[i];

                let object = {};
                try { object = await JSON.parse(obj) } catch { }
                if (object.title) {
                    const TokenId = Number(await contract.gettokenIdByUri(obj).call());

                    arr.push({
                        Id: m_prefix+ TokenId.toString(),
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



    async function GetMoonbeamEventUri(id) {
        if (contract) {
            const valueAll = await contract.eventURI(id).call();
            return valueAll;

        }
        return [];
    }

    async function GetMoonbeamTokenUri(id) {
        if (contract) {
            const valueAll = await contract.tokenURI(id).call();
            return valueAll;

        }
        return [];
    }
    async function GetMoonbeamEvents() {
        if (contract) {


            const totalEvent = await contract.totalEvent().call();
            const arr = [];

            for (let i = 0; i < Number(totalEvent); i++) {
                const valueAll = await contract.eventURI(m_prefix +i).call();
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
                        wallet: object.properties.wallet.description,
                        logo: object.properties.logo.description.url,
                    });
                }
            }
            return arr;
        } else {
            return [];
        }
    }
    async function GetMoonbeamTotalEvent() {
        if (contract) {

            const totalEvent = await contract.totalEvent().call();
            return Number(totalEvent);

        }
        return 0;
    }
    async function GetMoonbeamEventRaised(id) {
        if (contract) {

            const totalEventRaised = await contract.getEventRaised(id).call();
            return Number(totalEventRaised);

        }
        return 0;
    }

    async function GetNftBidsByTokenId(id){
        const arr = [];
        if (contract && id) {
            const totalBids = await contract.getBidsSearchToken(id).call();
            for (let i = 0; i < Number(10); i++) {
                const obj = await totalBids[i];
                let object = {};
                try { object = await JSON.parse(obj) } catch { }
                if (object.title) {
                    const BidId = Number(await contract.getBidIdByUri(obj).call());
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
    const ParseBigNum = (num) => Number(num.toString().replaceAll(",", "")) / 1e18;
    const WrapBigNum = (num) => (Number(num.toString().replaceAll(",", "")) * 1e18).toFixed(0);

    return <AppContext.Provider value={{
        moon_api: api,
        moon_contract: contract,
        moon_signerAddress: signerAddress,
        moon_loadingContract: loadingContract,
        moon_sendTransaction: sendTransaction,
        moon_ReadContractValue: ReadContractValue,
        moon_ReadContractByQuery: ReadContractByQuery,
        moon_getMessage: getMessage,
        moon_getQuery: getQuery,
        moon_getTX: getTX,
        moon_ParseBigNum: ParseBigNum,
        moon_WrapBigNum: WrapBigNum,
        moon_GetMoonbeamEvents: GetMoonbeamEvents,
        moon_GetMoonbeamEventUri: GetMoonbeamEventUri,
        moon_GetMoonbeamTokenUri: GetMoonbeamTokenUri,
        moon_GetAllEventTokens: GetAllEventTokens,
        moon_GetMoonbeamEventRaised:GetMoonbeamEventRaised,
        moon_GetMoonbeamTotalEvent: GetMoonbeamTotalEvent,
        moon_GetNftBidsByTokenId: GetNftBidsByTokenId,
        moon_GetEventEnded: GetEventEnded,
        moon_GetHighestBid: GetHighestBid,
    }}>{children}</AppContext.Provider>;

}

export const useMoonbeamContext = () => useContext(AppContext);

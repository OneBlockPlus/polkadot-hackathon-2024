'use client';
import { useState, useEffect, useContext } from "react";

import { createContext } from 'react';
import { usePolkadotContext } from "./PolkadotContext";
import { useMoonbeamContext } from "./MoonbeamContext";

const AppContext = createContext({
    api: null,
    contract: null,
    LoggedType: "",
    FormatOtherType: "",
    contract2: null,
    signerAddress: null,
    loadingContract: true,
    sendTransaction: async (method, argument = [], value = 0) => { },
    ReadContractValue: (msg, msgWithArgs) => { },
    ReadContractByQuery: async (query, argument = null) => { },
    getMessage: (find_contract) => { },
    getQuery: (find_contract) => { },
    getTX: (find_contract) => { },
    ParseBigNum: (num) => { },
    WrapBigNum: (num) => { },
    CurrentToken: "",
    GetAllEvents: async () => [],
    GetEventUri: async (id: String | Number) => [],
    GetTokenInfo: async (id: String | Number) => [],
    GetAllEventTokens: async (id: String | Number) => [],
    GetEventRaised: async (id: String) => 0,
    GetNftBidsByTokenId: async (id: String) => [],
    GetTotalEvents: async () => 0,
    GetEventEnded:async (id)=> false,
    polka_SendMoney:async (to,price)=> {}
});


export function MixedProvider({ children }) {
    const { polka_api, polka_contract, polka_signerAddress, polka_sendTransaction, polka_loadingContract, polka_ParseBigNum, polka_GetPolkadotEvents, polka_GetPolkadotTotalEvent, polka_GetPolkadotEventUri,polka_GetPolkadotTokenUri,  polka_GetAllEventTokens, polka_GetPolkadotEventRaised, polka_ReadContractByQuery, polka_ReadContractValue, polka_getTX, polka_getQuery, polka_getMessage,polka_GetNftBidsByTokenId,polka_GetHighestBid,polka_GetEventEnded,polka_SendMoney } = usePolkadotContext();
    const { moon_api, moon_contract, moon_signerAddress, moon_sendTransaction, moon_loadingContract, moon_ParseBigNum, moon_GetMoonbeamEvents, moon_GetMoonbeamTotalEvent, moon_GetMoonbeamEventUri, moon_GetMoonbeamTokenUri,moon_GetAllEventTokens, moon_GetMoonbeamEventRaised, moon_ReadContractByQuery, moon_ReadContractValue, moon_getQuery, moon_getTX, moon_getMessage,moon_GetNftBidsByTokenId,moon_GetHighestBid,moon_GetEventEnded } = useMoonbeamContext();

    const [MixedApi, setApi] = useState(null);
    const [MixedContract, setContract] = useState(null);
    const [MixedContract2, setContract2] = useState(null);
    const [MixedSignerAddress, setSignerAddress] = useState(null);
    const [MixedloadingContract, setLoadingContract] = useState(true);
    const [MixedCurrentToken, setCurrentToken] = useState("");

    const [LoggedType, setLoggedType] = useState("");
    const [FormatOtherType, setFormatOtherType] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setLoggedType(window.localStorage.getItem("login-type"));
            if (window.localStorage.getItem("login-type") === "polkadot") {
                setApi(polka_api);
                setContract(polka_contract);
                setContract2(moon_contract)
                setSignerAddress(polka_signerAddress);
                setLoadingContract(polka_loadingContract);
                setCurrentToken("SBY");
                setFormatOtherType("Moonbeam")

            } else if (window.localStorage.getItem("login-type") === "metamask") {
                setContract2(polka_contract)
                setApi(polka_api);
                setContract(moon_contract);
                setSignerAddress(moon_signerAddress);
                setLoadingContract(moon_loadingContract);
                setCurrentToken("DEV");
                setFormatOtherType("Polkadot")

            } else {
                setLoadingContract(false);
            }

        };

        fetchData();
    }, [polka_api, polka_contract, polka_signerAddress, polka_loadingContract, moon_api, moon_contract, moon_signerAddress, moon_loadingContract]);



    async function sendTransaction(method, argument = [], value = 0) {
        if (LoggedType === "metamask") {
            await moon_sendTransaction(method, argument, value)
        } else {
            await polka_sendTransaction(method, argument, value)
        }
    }

    async function ReadContractValue(msg, msgWithArgs) {
        if (LoggedType === "polkadot") {
            return polka_ReadContractValue(msg, msgWithArgs);
        } else {
            return moon_ReadContractValue(msg, msgWithArgs);

        }
    }

    async function ReadContractByQuery(query, argument = null) {
        if (LoggedType === "polkadot") {
            return await polka_ReadContractByQuery(query, argument);
        } else {
            return await moon_ReadContractByQuery(query, argument);

        }

    }
    function getMessage(find_contract) {
        if (LoggedType === "polkadot") {
            return polka_getMessage(find_contract);
        } else {
            return moon_getMessage(find_contract);

        }
    }

    function getQuery(find_contract) {
        if (LoggedType === "polkadot") {
            return polka_getQuery(find_contract);
        } else {
            return find_contract;

        }
    }
    function getTX(find_contract) {
        if (LoggedType === "polkadot") {
            return polka_getTX(find_contract);
        } else {
            return moon_getTX(find_contract);

        }
    }

    const ParseBigNum = (num) => {
        if (LoggedType === "metamask") {
            return moon_ParseBigNum(num);

        } else if (LoggedType === "polkadot") {
            return polka_ParseBigNum(num);

        } else {
            return num;
        }

    }
    const WrapBigNum = (num) => {

    }


    async function GetAllEvents() {
        let arr: Event[] = [];
        let _marr = await moon_GetMoonbeamEvents();
        let _parr = await polka_GetPolkadotEvents();
        arr = arr.concat(_marr)
        arr = arr.concat(_parr)
        arr = await AssignEndedToEvents(arr);
        return arr;
    }

    async function GetEventUri(id: String) {
        let event;
        if (id.toString().startsWith("p_")) {
            event =  await polka_GetPolkadotEventUri(id);
        } else {
            event = await moon_GetMoonbeamEventUri(id);
        }
        return event;
    }
    async function AssignEndedToEvents(events){
        for (let i = 0; i < events.length; i++) {
            
            events[i].ended = await GetEventEnded(events[i].Id)
            
        }
        return events;
    }
    async function GetAllEventTokens(id: String) {
        let arr = [];
        let _marr = await moon_GetAllEventTokens(id);
        let _parr = await polka_GetAllEventTokens(id);
        arr = arr.concat(_marr)
        arr = arr.concat(_parr)
        arr = await AssignPricesToTokens(arr)
        return arr;

    }
    async function AssignPricesToTokens(tokens){
        for (let i = 0; i < tokens.length; i++) {
            
            tokens[i].price = await GetHighestBidOfToken(tokens[i].Id,tokens[i].price)
            
        }
        return tokens;
    }
    async function GetHighestBidOfToken(id,price){
        let _marr = await moon_GetHighestBid(id);
        let _parr = await polka_GetHighestBid(id);
        if (_marr != -1 && _marr > _parr) return _marr;
        if (_parr != -1 && _marr < _parr) return _parr;
        return price;
    } 

    async function GetEventEnded(id){
        let _marr = await moon_GetEventEnded(id);
        let _parr = await polka_GetEventEnded(id);
        if (_marr != false ) return _marr;
        if (_parr != false) return _parr;
        return false;

    }
    async function GetTokenInfo(tokenId) {
        if (tokenId.toString().startsWith("p_")) {
            return await polka_GetPolkadotTokenUri(tokenId);
        }else{
            return await moon_GetMoonbeamTokenUri(tokenId);
        }
    }

    async function GetTotalEvents() {
        if (LoggedType === "polkadot") {
            return await polka_GetPolkadotTotalEvent();
        } else {
            return await moon_GetMoonbeamTotalEvent();
        }
    }
    async function GetNftBidsByTokenId(id: String){
        let arr = [];
        let _marr = await moon_GetNftBidsByTokenId(id);
        let _parr = await polka_GetNftBidsByTokenId(id);
        arr = arr.concat(_marr)
        arr = arr.concat(_parr)
        return arr;
    }
    async function GetEventRaised(id: String) {
        let lastRaisedMoon = await moon_GetMoonbeamEventRaised(id);
        let lastRaisedPolka = await polka_GetPolkadotEventRaised(id);
        if (lastRaisedMoon >lastRaisedPolka) return lastRaisedMoon;
        if (lastRaisedMoon < lastRaisedPolka) return lastRaisedPolka;
        return 0;

    }
    return <AppContext.Provider value={{
        api: MixedApi,
        LoggedType: LoggedType,
        FormatOtherType: FormatOtherType,
        GetEventRaised: GetEventRaised,
        contract: MixedContract,
        contract2: MixedContract2,
        signerAddress: MixedSignerAddress,
        loadingContract: MixedloadingContract,
        sendTransaction: sendTransaction,
        ReadContractValue: ReadContractValue,
        ReadContractByQuery: ReadContractByQuery,
        getMessage: getMessage,
        getQuery: getQuery,
        getTX: getTX,
        ParseBigNum: ParseBigNum,
        WrapBigNum: WrapBigNum,
        CurrentToken: MixedCurrentToken,
        GetAllEvents: GetAllEvents,
        GetTotalEvents: GetTotalEvents,
        GetAllEventTokens: GetAllEventTokens,
        GetEventUri: GetEventUri,
        GetTokenInfo: GetTokenInfo,
        GetNftBidsByTokenId:GetNftBidsByTokenId,
        GetEventEnded:GetEventEnded,
        polka_SendMoney:polka_SendMoney
    }}>{children}</AppContext.Provider>;

}

export const useMixedContext = () => useContext(AppContext);
export  interface Event{
    eventId:String,
    Title:String,
    Date:String,
    Goal:Number,
    wallet:String,
    logo:String,
    ended?:boolean
}
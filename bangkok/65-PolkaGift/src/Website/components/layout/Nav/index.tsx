import React, { useState, useEffect } from 'react';
import NavLink from 'next/link';
import isServer from "../../../components/isServer";

import { useMixedContext } from '../../../contexts/MixedContext';
declare let window: any;
let running = false;

export function Nav(): JSX.Element {
    const [acc, setAcc] = useState('');
    const [Balance, setBalance] = useState('');
    const [count, setCount] = useState(0);
    const [role, setRole] = useState("");
    const {CurrentToken,signerAddress,api,ParseBigNum } = useMixedContext();

    const [isSigned, setSigned] = useState(false);
    async function fetchInfo() {
        setRole(window.localStorage.getItem("Type"));
      
        if (window.localStorage.getItem("login-type") === "metamask") {
            if (signerAddress != null) {
                try {
                    const Web3 = require("web3")
                    const web3 = new Web3(window.ethereum)
                    let Balance = await web3.eth.getBalance(signerAddress);
                    let subbing = 10;

                    if (window.innerWidth > 500) {
                        subbing = 20;
                    }
                    let token = ` ${CurrentToken}` 

                    setAcc((signerAddress as string)?.toString().substring(0, subbing) + "...");
                    setBalance(ParseBigNum(Balance) + token);
                    if (!isSigned)
                        setSigned(true);


                    window.document.getElementById("withoutSign").style.display = "none";
                    window.document.getElementById("withSign").style.display = "";
                    running = false;
                    return;
                } catch (error) {
                    console.error(error);
                    running = false;
                    return;
                }

            } else {
                running = false;
                return;
            }
        } else if (window.localStorage.getItem("login-type") === "polkadot"){
            if (signerAddress  && api) {
                try {
                    const { nonce, data: balance } = await (api as any).query.system.account(signerAddress);

                    let Balance = ParseBigNum(Number(balance.free.toString()));

                    let subbing = 10;

                    if (window.innerWidth > 500) {
                        subbing = 20;
                    }
                    let token = ` ${CurrentToken}` 

                    setAcc((signerAddress as string)?.toString().substring(0, subbing) + "...");
                    setBalance(Balance + token);
                    if (!isSigned)
                        setSigned(true);


                    window.document.getElementById("withoutSign").style.display = "none";
                    window.document.getElementById("withSign").style.display = "";
                    running = false;
                    return;
                } catch (error) {
                    console.error(error);
                    running = false;
                    return;
                }

            } else {
                running = false;
                return;
            }
        }
    }
    useEffect(() => {
        if (!running) {
            if (!isSigned || acc === "") {

                running = true;
                fetchInfo();
            }
        }
        if (acc !== "") { running = false; }
    }, [count]);


    setInterval(() => {
        if (!isServer()) {
            if (document.readyState === "complete" && !running && acc === "") {
                setCount(count + 1);
            }
        }
    }, 1000)

    function NavButtons(): JSX.Element {

        return (<>
            <li>
                <NavLink href="/donation" id="donationbtnNav">
                    Donation
                </NavLink>
            </li>
           
            <li>
                <NavLink href="/CreateEvents">
                    Create Events
                </NavLink>
            </li>
           
        </>)
    }

    async function onClickDisConnect() {
        window.localStorage.setItem("Type", "")
        window.localStorage.setItem('login-type', "");
        window.location.href = "/";
    }

    function TypeSet(type: string) {
        window.localStorage.setItem("Type", type);
        window.location.reload();
    }


    return (
        <nav className="main-nav">
            <ul>
                {isSigned ? <> <NavButtons /></> : <>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li></>}


                <li className='Nav walletstatus'>
                    <div id='withoutSign' className="wallets">
                        <NavLink href="/login?[/]">
                            <div className="wallet">
                                <button type="button" className="btn btn-secondary" aria-disabled="false">
                                    Login
                                </button>
                            </div>
                        </NavLink>
                    </div>
                    <div id='installMetamask' style={{ display: "none" }} className="wallets">

                        <div className="wallet">
                            <button type="button" onClick={() => { window.open("https://chrome.google.com/webstore/detail/metamask/ibnejdfjmmkpcnlpebklmnkoeoihofec", "_blank") }} className="btn btn-secondary" aria-disabled="false">
                                Install Metamask Or Polkadot
                            </button>
                        </div>
                    </div>

                    <div id="withSign" className="wallets" style={{ display: "none" }}>
                        <div style={{ height: 48, display: "flex", alignItems: "center" }}>
                            <div className="role-changer">
                                <button type="button" onClick={() => TypeSet("manager")} className={`${role == ("manager") ? "active" : ""} btn btn-secondary`}>
                                    Manager
                                </button>
                                <button type="button" onClick={() => TypeSet("Donator")} className={`${role == ("Donator") ? "active" : ""} btn btn-primary`}>
                                    Donator
                                </button>
                            </div>
                        </div>

                        <div className="wallet" style={{ height: 48, display: "flex", alignItems: "center" }}>
                            <div className="wallet__wrapper" style={{ display: "flex", alignItems: "center", height: "100%" }}>

                                <div className="wallet__info" >
                                    <div className="wallet__address" style={{ fontSize: 14, letterSpacing: "0.5px" }}>
                                        {acc}
                                    </div>
                                    <div className="wallet__balance" style={{ fontSize: 12, letterSpacing: "0.6px" }}>
                                        {Balance}
                                    </div>
                                </div>
                                <button type="button" onClick={onClickDisConnect} className="btn btn-logout" style={{ padding: 0 }}>
                                    <span className="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" height={32} width={32} style={{ fill: "red" }}>
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M18.4753 18.2903H19.295H20.1146V21.5162V23.9355H15.1966L15.1967 27L13.0492 26.2799L8.11633 24.662C7.4459 24.433 7 24.2782 7 24.2782V7H8.63938C8.66196 7 8.68378 7.00459 8.70558 7.00919C8.72248 7.01275 8.73936 7.0163 8.75659 7.01772C8.76929 7.01605 8.78125 7.01267 8.79315 7.00931C8.80968 7.00464 8.8261 7 8.84424 7H17.6556H20.1146V11.8387H19.295H18.4753L18.4754 8.61267L17.6556 8.61281H13.8376H11.918L15.1966 9.41936V22.3226H18.4753V21.5162V18.2903ZM23.153 11.2686L27 15.0644C27 15.0644 26.7522 15.3194 26.4318 15.6346L23.153 18.8605L21.7541 20.2257L21.7539 15.8709H17.6556V15.0645V14.2581H21.7539L21.7541 9.90301L23.153 11.2686Z"
                                            />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </nav>
    )
}

import { React, useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import Head from 'next/head';
import isServer from '../../components/isServer';

export default function Login() {
    const [RoleType,setRoleType] = useState("");
    const [WalletType,setWalletType] = useState("");

    let redirecting = "";
    if (!isServer()) {
        const regex = /\[(.*)\]/g;
        const str = decodeURIComponent(window.location.search);
        let m;
        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            redirecting = m[1];
        }

    }

    function Continue(){
        
        window.localStorage.setItem("Type", RoleType);
        window.localStorage.setItem("login-type", WalletType);
        window.location.href = redirecting;
    }
    async function TypeSet(e) {
        setRoleType(e.target.getAttribute("type"));
    }

    async function onClickConnectMetamask() {
        if (typeof window.ethereum === "undefined") {
            window.open(
                "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
                "_blank"
            );
            return;
        }
        let result = await window.ethereum.request({ method: 'eth_requestAccounts' });
        result;
        try {
            const getacc = await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x507', }], //1287
            });
            getacc;
            
        setWalletType("metamask");
    
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: '0x507', //1287
                                chainName: 'Moonbase Alpha',
                                nativeCurrency: {
                                    name: 'DEV',
                                    symbol: 'DEV',
                                    decimals: 18,
                                },
                                rpcUrls: ['https://rpc.api.moonbase.moonbeam.network'],
                            },
                        ],
                    });
                } catch (addError) {
                    // handle "add" error
                    console.log(addError);
                }
            }
            // handle other "switch" errors
        }

    }
    async function onClickConnectPolkadot(){
        
        const polkadot = await import("@polkadot/extension-dapp");

        await polkadot.web3Enable("YT Purchase");
        const allAccounts = await polkadot.web3Accounts();
        if (allAccounts[0] != null) {
            setWalletType("polkadot");
        }
    }


    useEffect(() => {
        if (!isServer()) {
            setInterval(() => {
                if (window.localStorage.getItem("login-type") == "metamask" && window.ethereum.selectedAddrss != null) {
                    window.location.href = redirecting;
                }
            }, 1000);
        }
    }, []);
    if (isServer()) return null;

    

    function EventManger() {

        return (<>
            <div type="manager" onClick={TypeSet} className= {`Login eventManagerButton ${RoleType == "manager"?'active':""}`}>
                <span type="manager" >Event Manager</span>
            </div>
        </>)
    }
    function DonatorType() {
        return (<>
            <div type="Donator" onClick={TypeSet} className= {`Login userButton ${RoleType == "Donator"?'active':""}`}>
                <span type="Donator" >Donator</span>
            </div>
        </>)

    }


    const inValid=()=> RoleType === "" || WalletType === "";
    return (
        <><>
            <Head>
                <title>Login</title>
                <meta name="description" content="Login" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header></Header>
            <div className="Login row">
                <div className="Login col">
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className='Login container LoginContainer' >
                            <div style={{ margin: "0px 0px 30px 0px" }}>
                                <h2 style={{ marginBottom: "10px" }}>Connect Your Wallet</h2>
                            </div>

                            <div style={{ margin: "18px 0px", display: "flex", justifyContent: "space-between" }} >
                                <div  type="metamask" className={`WalletBtn ${WalletType == "metamask"?'active':''}`}>
                                    <img onClick={onClickConnectMetamask} src="https://1000logos.net/wp-content/uploads/2022/05/MetaMask-Logo.png" />
                                </div>
                                <div type="polkadot" className={`WalletBtn ${WalletType == "polkadot"?'active':''}`} >
                                    <img onClick={onClickConnectPolkadot} src="https://1000logos.net/wp-content/uploads/2022/08/Polkadot-Logo-2048x1152.png" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="Login row">
                <div className="Login col">
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className='Login container LoginContainer' >
                            <div style={{ margin: "0px 0px 30px 0px" }}>
                                <h2 style={{ marginBottom: "10px" }}>Select a role type</h2>
                            </div>

                            <div style={{ margin: "18px 0px", display: "flex", justifyContent: "space-between" }} >
                                <EventManger />
                                <DonatorType />
                            
                            </div>
                            <div><button className='btn float-end btn--empty' disabled={inValid()} onClick={Continue}>Continue</button></div>
                        </div>
                    </div>
                </div>
               
            </div>
        </></>
    );
}
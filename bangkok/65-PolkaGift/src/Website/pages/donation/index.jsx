import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import NavLink from 'next/link';

import useContract from '../../services/useContract';
import DonateNFTModal from '../../components/components/modals/DonateNFTModal';
import { Header } from '../../components/layout/Header'
import isServer from '../..//components/isServer';
import { useUtilsContext } from '../../contexts/UtilsContext';


export default function Donation() {

    const [CreatemodalShow, setModalShow] = useState(false);
    const { contract, signerAddress, sendTransaction } = useContract();
    const [list, setList] = useState([]);
    const [selectid, setselectid] = useState('');
    const [selectedtype, setselectedtype] = useState('');
    const [selectedWallet, setselectedWallet] = useState('');
    const [SelectedTitle, setSelectedTitle] = useState('');
    const [SelectedendDate, setSelectedendDate] = useState('');


    useEffect(() => {
        fetchContractData();


    }, [contract]);
    setInterval(function () {
        calculateTimeLeft();
    }, 1000);

    if (isServer()) return null;


    function calculateTimeLeft() {
        try {
            var allDates = document.getElementsByName("DateCount");
            for (let i = 0; i < allDates.length; i++) {
                var date = (allDates[i]).getAttribute("date");
                allDates[i].innerHTML = LeftDate(date);
            }
        } catch (error) {

        }

    }

    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    async function fetchContractData() {
        try {
            if (contract) {


                const totalEvent = await contract.totalEvent().call();
                const arr = [];

                for (let i = 0; i < Number(totalEvent); i++) {
                    const valueAll = await contract.eventURI(i).call();
                    const value = valueAll[1];

                    console.log(value);
                    if (value) {
                        const object = JSON.parse(value);
                        var c = new Date(object.properties.Date.description).getTime();
                        var n = new Date().getTime();
                        var d = c - n;
                        var s = Math.floor((d % (1000 * 60)) / 1000);
                        if (s.toString().includes("-")) {
                            continue;
                        }

                        var pricedes1 = 0;
                        try { pricedes1 = Number(object.properties.Goal.description * 1.10) } catch (ex) { }

                        arr.push({
                            eventId: i,
                            Title: object.properties.Title.description,
                            Date: object.properties.Date.description,
                            Goalusd: formatter.format(pricedes1),
                            Goal: object.properties.Goal.description,
                            wallet: object.properties.wallet.description,
                            logo: object.properties.logo.description.url,
                        });
                    }
                    console.log(value);
                }

                setList(arr);
                document.getElementById("Loading").style = "display:none";
            }
        } catch (error) {
            console.error(error);
        }
    }
    function activateCreateNFTModal(e) {
        setselectid(e.target.getAttribute("eventid"));
        setSelectedTitle(e.target.getAttribute("eventtitle"));
        setSelectedendDate(e.target.getAttribute("date"));
        setselectedWallet(e.target.getAttribute("wallet"));
        setselectedtype("NFT");

        setModalShow(true);
    }

    function LeftDate(datetext) {
        var c = new Date(datetext).getTime();
        var n = new Date().getTime();
        var d = c - n;
        var da = Math.floor(d / (1000 * 60 * 60 * 24));
        var h = Math.floor((d % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var m = Math.floor((d % (1000 * 60 * 60)) / (1000 * 60));
        var s = Math.floor((d % (1000 * 60)) / 1000);
        if (s.toString().includes("-")) {
            return "Expired";
        }
        return (da.toString() + " Days " + h.toString() + " hours " + m.toString() + " minutes " + s.toString() + " seconds");
    }

    return (
        <>
            <Header></Header>
            <Head>
                <title>Donation</title>
                <meta name="description" content="Donation" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className='DonationBar row'>
                <NavLink href='?q=All'>
                    <a className='DonationBarLink active'>
                        All
                    </a>
                </NavLink>
                <NavLink href='?q=Today'>
                    <a className='DonationBarLink'>
                        Today
                    </a>
                </NavLink>
                <NavLink href='?q=This Month'>
                    <a className='DonationBarLink'>
                        This Month
                    </a>
                </NavLink>
            </div>
            <div id='Loading' className="LoadingArea">
                <h1>Loading...</h1>
            </div>
            <div style={{ height: '100%' }}>
                {list.map((listItem) => (
                    <div key={listItem.eventId} className="donation row" >
                        <div className="donation Datecount">
                            <h6 name="DateCount" className="donation DatecountT" date={listItem.Date}>{LeftDate(listItem.Date)}</h6>
                        </div>
                        <div className='donation-eventconatiner' >
                            <img className='donation event-img' src={listItem.logo} />
                            <div className='donation event-details-container' >
                                <h6 className='donation event-details-title'>{listItem.Title}</h6>
                                <div style={{ display: "flex", "whiteSpace": "pre-wrap" }}>
                                    <h6 className='donation event-goal-price' >Goal:  </h6>
                                    <h6 className='donation event-goal-price' >{listItem.Goal} DEV</h6>
                                </div>
                                <div style={{ display: "flex", "whiteSpace": "pre-wrap" }}>
                                    <h6 className='donation event-goal-price' >Owner:  </h6>
                                    <h6 className='donation event-goal-price' >{listItem.wallet}</h6>
                                </div>
                            </div>
                            <div className='donation event-BTN-container'>
                                {(window.localStorage.getItem('Type') == "" || window.localStorage.getItem('Type') == null) ? (<>
                                    <NavLink href={`/login?[/donation]`}>
                                        <div className='donation event-BTN card'>
                                            <div className="donation event-btn-text card-body" style={{ height: "100%" }}>
                                                Login
                                            </div>
                                        </div>
                                    </NavLink >
                                </>) : (window.localStorage.getItem('Type') == "Donator" ? (<>
                                    <div className='donation event-BTN card' eventid={listItem.eventId} date={listItem.Date} eventtitle={listItem.Title} wallet={listItem.wallet} onClick={activateCreateNFTModal} >
                                        <div eventid={listItem.eventId} date={listItem.Date} eventtitle={listItem.Title} wallet={listItem.wallet} className="donation event-btn-text card-body" style={{ height: "100%" }}>
                                            Donate NFT
                                        </div>
                                    </div>
                                    <NavLink href={`/donation/auction?[${listItem.eventId}]`}>
                                        <div className='donation event-BTN card'>
                                            <div className="donation event-btn-text card-body" style={{ height: "100%" }}>
                                                Go to auction
                                            </div>
                                        </div>
                                    </NavLink >
                                </>) : (<>
                                    <NavLink href={`/donation/auction?[${listItem.eventId}]`}>
                                        <div className='donation event-BTN card'>
                                            <div className="donation event-btn-text card-body" style={{ height: "100%" }}>
                                                Go to auction
                                            </div>
                                        </div>
                                    </NavLink >
                                </>))}

                            </div>
                        </div>

                    </div>
                ))}
            </div>

            <DonateNFTModal
                show={CreatemodalShow}
                onHide={() => {
                    setModalShow(false);
                }}
                contract={contract}
                senderAddress={signerAddress}
                EventWallet={selectedWallet}
                sendTransaction={sendTransaction}
                EventID={selectid}
                type={selectedtype}
                SelectedTitle={SelectedTitle}
                enddate={SelectedendDate}
            />
        </>
    );
}

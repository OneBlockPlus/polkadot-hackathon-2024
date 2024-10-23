import React, {useEffect, useState} from 'react';
import {usePolkadotContext} from '../context/PolkadotContext';
import styles from './css/withdraw.module.css';
import axios from 'axios';


const Withdraw = () => {
    const {
        contract,
        api,
        ReadContractByQuery,
        ReadContractValue,
        getMessage,
        getQuery,
        getTX,
        loadingContract,
        sendTransaction,
        signerAddress
    } = usePolkadotContext();
    const [TotalCredits, setTotalCredits] = useState(0);
    const [price, setPrice] = useState(0);
    const [walletAddress, setWalletAddress] = useState('');
    const [list, setList] = useState([]);
    const [processing, setProcessing] = useState(false);

    async function getAllVideos() {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/videos`);

            return (res.data);
        } catch (err) {
        }
        return [];
    }

    async function fetchData() {
        if (api) {
            let creditAvailable = await ReadContractByQuery(api, signerAddress, getQuery("_walletEarned"), [signerAddress]);
            setTotalCredits(window.ParseBigNum(creditAvailable));
            let allPurchasedOfCurrentUser = await ReadContractByQuery(api, signerAddress, getQuery("getUserPurchasedByWallet"), [signerAddress]);


            let allVideos = await getAllVideos();
            let arr = [];
            for (let i = 0; i < Number(allPurchasedOfCurrentUser.length); i++) {
                let elm = allPurchasedOfCurrentUser[i];
                let purchase_element = await ReadContractByQuery(api, signerAddress, getQuery("_purchaseMap"), [Number(elm)])
                let filter = allVideos.filter((item) => item._id == purchase_element.videoId);
                if (filter.length > 0) {
                    purchase_element.youtubeUrl = filter[0].youtubeUrl
                    let adFilter = filter[0].productAds.filter((item) => item._id == purchase_element.adId);
                    if (adFilter.length > 0) {
                        purchase_element.details = adFilter[0];
                    }
                }
                purchase_element.date = new Date(Number(purchase_element.date.replaceAll(",", ""))).toLocaleDateString()
                purchase_element.price = window.ParseBigNum(purchase_element.price);
                purchase_element.meta = JSON.parse(purchase_element.meta);
                arr.push(purchase_element);

            }

            setList(arr.reverse());
        }

    }

    async function Withdraw() {
        setProcessing(true);
        await sendTransaction(api, signerAddress, "WithDrawAmount", [walletAddress, window.WrapBigNum(price)]);
        setProcessing(false);
        fetchData();
        setPrice("")
        setWalletAddress("")
    }


    useEffect(() => {
        fetchData();
    }, [signerAddress])

    const ValidWithdraw = () => {
        return walletAddress.length != 0 && Number(price) > 0 && Number(TotalCredits) > 0 && !processing;
    }
    return (
        <div>
            <div id="account-area" className={styles['account-area']}>
                <div className={styles['container']}>
                    <div className="row">
                        <div className="col-lg-4 mb-3">
                            <div className={styles['withdraw'] + " " + styles['status']}>
                                <h5>Withdrawable</h5>
                                <h2>
                                    <span id="current-withdraw">{TotalCredits}</span> SBY
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles['container']}>
                    <div className="row">
                        <div className="col-lg-6">
                            <div className={styles['submit-area']}>
                                <h4>Withdraw Amount</h4>
                                <input
                                    onChange={(e) => {
                                        setPrice(e.target.value)
                                    }}
                                    id="withdraw-amount"
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter withdraw amount"
                                />
                                <br/>
                                <input
                                    onChange={(e) => {
                                        setWalletAddress(e.target.value)
                                    }}
                                    id="withdraw-address"
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter Wallet Address"
                                />
                                <br/>
                                <button id="withdraw-btn" onClick={Withdraw} disabled={!ValidWithdraw()}
                                        className="btn btn-success">
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <hr/>
            <div>
                <h1>Purhcase Logs</h1>

            </div>


            <table className='table table-stripped'>
                <thead>
                <th>Video URL</th>
                <th>Ad</th>
                <th>Name</th>
                <th>Email</th>
                <th>Price</th>
                <th>Date</th>
                <th>Wallet</th>
                </thead>
                <tbody>
                {list.map((item) => <tr>
                    <td><a href={item?.youtubeUrl}
                           target='_blank'
                           rel="noreferrer">{item?.youtubeUrl?.substring(0, 5)}...{item?.youtubeUrl?.substring(item?.youtubeUrl?.length - 5, item?.youtubeUrl?.length)}</a>
                    </td>
                    <td>{item?.details?.title}</td>
                    <td>{item.meta.name}</td>
                    <td>{item.meta.email}</td>
                    <td>{item.price} SBY</td>
                    <td>{item.date}</td>
                    <td>{item.wallet.toString()}</td>
                </tr>)}


                </tbody>
            </table>

        </div>
    );
};


export default Withdraw;
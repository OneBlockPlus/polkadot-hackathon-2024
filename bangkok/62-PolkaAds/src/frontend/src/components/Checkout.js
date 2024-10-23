import React, {useEffect, useState} from 'react';
import {usePolkadotContext} from '../context/PolkadotContext';
import axios from 'axios';

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        adId: String(params.get('adId')),
        videoId: String(params.get('videoId')),
        videoTitle: String(params.get('videoTitle')),
    };
}

const Checkout = () => {
    const {
        contract,
        api,
        ReadContractByQuery,
        ReadContractValue,
        getMessage,
        getQuery,
        getTX,
        sendTransaction,
        signerAddress
    } = usePolkadotContext();
    const [urlData] = useState(getUrlParams());
    const [adData, setAdData] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isFormValid, setIsFormValid] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [purchasing, setPurchasing] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const fetchAdData = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/videos/${urlData.videoId}/ads/${urlData.adId}`);
            setAdData(res.data);
        } catch (err) {
            console.error('Failed to fetch ad data', err);
        }
    };

    useEffect(() => {
        if (urlData.adId) {
            fetchAdData();
        }
    }, [urlData.adId]);

    useEffect(() => {
        if (name.trim() !== '' && emailRegex.test(email)) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }, [name, email]);

    async function Purchase() {
        const meta = JSON.stringify({name, email});
        setPurchasing(true);
        await sendTransaction(api, signerAddress, "Purchase", [
            adData._id,
            urlData.videoId,
            signerAddress,
            window.WrapBigNum(adData.price),
            adData.walletAddress,
            (new Date()).valueOf(),
            meta
        ], window.WrapBigNum(adData.price));
        setPaymentSuccess(true);
        setPurchasing(false);
    }

    return (
        !paymentSuccess ? <div style={styles.container}>
            <h1 style={styles.header}>Checkout</h1>
            {adData ? (
                <>
                    <p style={styles.text}>Video Title: {urlData.videoTitle}</p>
                    <p style={styles.text}>Product: {adData.title}</p>
                    <p style={styles.text}>Price: {adData.price} SBY</p>
                </>
            ) : (
                <p style={styles.text}>Loading ad data...</p>
            )}

            {/* User input form for name and email */}
            <div style={styles.form}>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                />
            </div>

            {signerAddress && (
                <button
                    onClick={Purchase}
                    disabled={!isFormValid || !adData || purchasing}
                    style={{
                        ...styles.button,
                        backgroundColor: isFormValid && !purchasing ? '#6C91C2' : '#ccc',
                        cursor: isFormValid && !purchasing ? 'pointer' : 'not-allowed'
                    }}
                >
                    Purchase
                </button>
            )}
        </div> : <div style={styles.successContainer}>
            <div style={styles.successHeading}>
                <span style={styles.successTickContainer}>
                    <i style={styles.successTick}>&nbsp;</i>
                </span>
                <span style={{color: 'green'}}>Your payment is successful</span>
            </div>
            <div style={styles.text}>
                <div>The manager will contact you via email.</div>
                <div>You can close this window.</div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        boxShadow: '5px 5px gray',
        marginTop: '40px',
        width: '100%',
        maxWidth: '600px',
        margin: '40px auto',
    },
    header: {
        fontSize: '2em',
        marginBottom: '20px',
        color: '#333',
    },
    text: {
        fontSize: '1.2em',
        color: '#555',
        marginBottom: '10px',
        textAlign: 'center',
    },
    form: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '20px',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginBottom: '10px',
    },
    button: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    successContainer: {
        textAlign: 'center',
        padding: '32px 16px',
        color: 'black',
    },
    successHeading: {
        fontSize: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        marginBottom: '32px',
    },
    successTickContainer: {
        padding: '20px',
        borderRadius: '50%',
        height: '56px',
        width: '56px',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgb(67 211 9)',
        marginBottom: '12px',
    },
    successTick: {
        color: 'green',
        transform: 'rotate(45deg)',
        height: '36px',
        width: '18px',
        borderBottom: 'solid 3px white',
        borderRight: 'solid 3px white',
    }
};

export default Checkout;
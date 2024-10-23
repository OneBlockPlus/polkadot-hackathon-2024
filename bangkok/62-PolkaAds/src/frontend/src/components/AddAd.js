import React, {useState} from 'react';
import axios from 'axios';
import {usePolkadotContext} from '../context/PolkadotContext';

const AddAd = ({videoId, onAdAdded}) => {
    const {signerAddress, loadingContract} = usePolkadotContext();

    const [title, setTitle] = useState('');
    const [image, setImage] = useState('');
    const [price, setPrice] = useState('');
    const [timingStart, setTimingStart] = useState('');
    const [timingEnd, setTimingEnd] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAddAd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (Number(timingStart) >= Number(timingEnd)) {
            setError('Timing Start must be less than Timing End.');
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/videos/${videoId}/ads`, {
                title,
                walletAddress: signerAddress,
                image,
                price: Number(price),
                timingStart: Number(timingStart),
                timingEnd: Number(timingEnd)
            });
            setTitle('');
            setImage('');
            setPrice('');
            setTimingStart('');
            setTimingEnd('');
            setLoading(false);
            if (onAdAdded) {
                onAdAdded(videoId, res.data);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error adding ad');
            setLoading(false);
        }
    };

    async function ConnectWallet() {

        const polkadot = await import("@polkadot/extension-dapp");

        await polkadot.web3Enable("YT Purchase");
        const allAccounts = await polkadot.web3Accounts();
        if (allAccounts[0] != null) {
            window.localStorage.setItem("type", "polkadot");
            window.location.reload();
        }

    }

    return (
        <form onSubmit={handleAddAd} style={styles.form}>
            <div style={styles.inputGroup}>
                <input
                    type="text"
                    placeholder="Ad Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={styles.input}
                />
            </div>

            <div style={styles.inputGroup}>
                <input
                    type="url"
                    placeholder="Image URL"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    required
                    style={styles.input}
                />
            </div>
            <div style={styles.inputGroup}>
                <input
                    type="number"
                    placeholder="Price in SBY"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    style={styles.input}
                    min="0"
                    step="0.01"
                />
            </div>
            <div style={styles.inputGroup}>
                <input
                    type="number"
                    placeholder="Timing Start (s)"
                    value={timingStart}
                    onChange={(e) => setTimingStart(e.target.value)}
                    required
                    style={styles.input}
                    min="0"
                />
            </div>
            <div style={styles.inputGroup}>
                <input
                    type="number"
                    placeholder="Timing End (s)"
                    value={timingEnd}
                    onChange={(e) => setTimingEnd(e.target.value)}
                    required
                    style={styles.input}
                    min="0"
                />
            </div>
            {signerAddress && !loadingContract && <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'Adding...' : 'Add'}
            </button>}
            {!signerAddress && <button disabled={loadingContract} style={styles.button} onClick={ConnectWallet}>
                {loading ? 'Loading...' : 'Connect Wallet'}
            </button>}

            {error && <p style={styles.error}>{error}</p>}
        </form>
    );
};

const styles = {
    form: {
        width: '100%',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '10px',
        backgroundColor: '#fff',
    },
    header: {
        color: '#333',
        textAlign: 'center'
    },
    inputGroup: {
        marginBottom: '10px'
    },
    input: {
        padding: '7px 15px', // Updated padding
        width: '100%',
        borderRadius: '6px',
        border: '1px solid #ccc',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.3s'
    },
    button: {
        backgroundColor: '#6C91C2',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1rem',
        marginTop: '10px',
        display: 'block',
        width: '100%',
    },
    error: {
        color: '#ff4d4f',
        marginTop: '10px',
        textAlign: 'center'
    }
};

export default AddAd;
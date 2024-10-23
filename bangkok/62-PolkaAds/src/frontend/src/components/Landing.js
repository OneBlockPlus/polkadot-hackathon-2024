import React from 'react';
import {Link} from 'react-router-dom';

const Landing = () => {
    return (
        <div style={styles.container}>
            {/* What is Polka Ads */}
            <section style={styles.section}>
                <h1 style={styles.heading}>What is Polka Ads?</h1>
                <p style={styles.text}>
                    Polka Ads is a cutting-edge web3 platform, powered by a Chrome extension, that seamlessly integrates
                    product advertisements into social media platforms. Viewers can purchase items directly from the
                    video without leaving the website, leveraging Polkadot’s blockchain for secure, on-chain
                    transactions. This makes Polkadot more accessible as part of everyday digital interactions and
                    bringing web3 innovation into mainstream content consumption
                </p>
            </section>

            {/* How it works for the Users */}
            <section style={styles.section}>
                <h2 style={styles.subheading}>How it works for the Users</h2>
                <p style={styles.text}>
                    Getting started with Polka Ads is easy! Just follow these simple steps to enjoy a seamless shopping
                    experience while watching your favorite YouTube videos:
                </p>
                <ol style={styles.stepsList}>
                    <li>First, install the Polka Ads and the Polkadot JS extensions. These will help you
                        connect and manage your purchases.
                    </li>
                    <li>
                        Create or log into your Polkadot account using the extension.
                    </li>
                    <li>Now, visit any supported website (currently, we support YouTube). As you watch videos, a small
                        ad will pop up at specific times, showing you cool products that you might like.
                        <img src="ad-example.png" style={styles.stepImage}/>
                    </li>
                    <li>See something you love? Simply click the "Purchase" button on the ad. A checkout form will
                        appear, where you can quickly fill in your name and email.
                        <img src="purchase-example.png" style={styles.stepImage}/>
                    </li>
                    <li>After clicking "Purchase", you'll be prompted to confirm the payment using the Polkadot JS
                        extension. Just sign the contract, and you're all set!
                        <img src="sign-example.png" style={styles.stepImage}/>
                    </li>
                    <li>Once your purchase is complete, you'll see a success message, and we'll follow up with you
                        shortly. It's that simple!
                        <img src="success-example.png" style={styles.stepImage}/>
                    </li>
                </ol>
            </section>

            {/* How it works for the Ad Managers */}
            <section style={styles.section}>
                <h2 style={styles.subheading}>How it works for the Ad Managers</h2>
                <p style={styles.text}>
                    Ad managers can upload ads and link them to specific videos. The platform provides purchase logs,
                    ensuring that managers can withdraw the money and contact customers effectively.
                </p>
            </section>

            {/* Useful Links */}
            <section style={styles.section}>
                <h2 style={styles.subheading}>Useful Links</h2>
                <ul style={styles.linkList}>
                    <li><Link to="/manager">Ad Manager Dashboard</Link></li>
                    <li><Link to="/withdraw">Withdraw Earnings</Link></li>
                </ul>
            </section>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: "'Poppins', sans-serif",
    },
    stepImage: {
        display: 'block',
        width: '70%',
        borderRadius: '10px',
        marginTop: '10px',
        marginBottom: '20px',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    section: {
        marginBottom: '40px',
    },
    heading: {
        fontSize: '2.5em',
        textAlign: 'center',
        color: '#333',
    },
    subheading: {
        fontSize: '2em',
        color: '#555',
    },
    text: {
        fontSize: '1.2em',
        lineHeight: '1.6',
        color: '#666',
        textAlign: 'justify',
    },
    stepsList: {
        fontSize: '1.2em',
        color: '#666',
        lineHeight: '1.8',
        paddingLeft: '20px',
    },
    linkList: {
        listStyle: 'none',
        padding: 0,
    },
    linkItem: {
        fontSize: '1.2em',
        marginBottom: '10px',
    }
};

export default Landing;
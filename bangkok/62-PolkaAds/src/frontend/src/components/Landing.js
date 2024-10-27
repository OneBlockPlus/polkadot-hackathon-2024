import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (

        <div style={styles.container}>
            <section
                style={styles.section1}
            >
                <div
                    style={styles.headContainer}
                >
                    <img src="/favicon.svg" height={350} style={{ borderRadius: "50%" }} />
                    <h2
                        style={styles.headText}
                    >
                        Instant shopping with Polkadot smart contracts
                    </h2>
                    <h5 style={{ fontSize: "1em", lineHeight: "1.6" }}>
                        Polka Ads is a web3 platform that embeds product ads into social media
                        platforms, allowing viewers to make purchases directly via a Chrome
                        extension, all secured by Polkadot’s blockchain.
                    </h5>
                </div>
                <img
                    src="ad-example.png"
                    style={styles.headImg2}
                />
            </section>

            <section
                style={styles.section2}
            >
                <div
                    style={styles.section_cotainer}
                >
                    <div
                        style={styles.section_head_container}
                    >
                        <div>
                            <h3 style={styles.font700}>How it works for the Users</h3>
                            <p
                                style={styles.sectionSubHeading}
                            >
                                Getting started with Polka Ads is easy! Just follow these simple steps
                                to enjoy a seamless shopping experience while watching your favorite
                                YouTube videos:
                            </p>
                            <ol
                                style={styles.sectionOl}
                            >
                                <li>
                                    First, install the Polka Ads and the Polkadot JS extensions. These
                                    will help you connect and manage your purchases.
                                </li>
                                <li>Create or log into your Polkadot account using the extension.</li>
                                <li>
                                    Now, visit any supported website (currently, we support YouTube). As
                                    you watch videos, a small ad will pop up at specific times, showing
                                    you cool products that you might like.
                                </li>
                            </ol>
                        </div>
                        <div style={styles.dflexcenter}>
                            <img
                                alt=""
                                loading="lazy"
                                width={360}
                                decoding="async"
                                data-nimg={1}
                                classname="shrink-0"
                                src="ad-example.png"
                                style={{border: '1px solid white'}}
                            />
                        </div>
                    </div>
                    <div
                        style={styles.section_head_container}
                    >
                        <div style={styles.dflexcenter}>
                            <img
                                alt=""
                                loading="lazy"
                                width={360}
                                decoding="async"
                                data-nimg={1}
                                classname="shrink-0"
                                src="purchase-example.png"
                                style={{border: '1px solid white'}}
                            />
                        </div>
                        <div>
                            <h3 style={styles.font700}>Checkout</h3>
                            <ol
                                style={styles.sectionOl}
                            >
                                <li>
                                    Just click on"Purchase" button on the ad. A checkout form will
                                    appear, where you can quickly fill in your name and email.
                                </li>
                                <li>
                                    After clicking "Purchase", you'll be prompted to confirm the payment
                                    using the Polkadot JS extension. Just sign the contract, and you're
                                    all set!
                                </li>
                                <li>
                                    Once your purchase is complete, you'll see a success message, and
                                    we'll follow up with you shortly. It's that simple!
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </section>


            <section
                style={styles.section3}
            >
                <div
                    style={styles.section_cotainer}
                >
                    <div
                        style={styles.section3Container}
                    >
                        <div style={{ width: "100%" }}>
                            <h3 style={styles.font700white}>Advertiser Flow</h3>
                            <p
                                style={styles.section3P}
                            >
                                Step 1: Open Polka Ads Manager and connect the wallet
                            </p>
                            <p
                                style={styles.section3P}
                            >
                             Step 2: Add a video
                            </p>
                        </div>
                        <div style={styles.dflexcenter}>
                            <img
                                alt=""
                                loading="lazy"
                                width={360}
                                decoding="async"
                                data-nimg={1}
                                classname="shrink-0"
                                src="manager-connect-wallet.png"
                                style={{border: '1px solid white'}}
                            />
                        </div>
                    </div>
                    <div
                        style={styles.section3imgContainer}
                    >
                        <div style={styles.dflexcenter}>
                            <img
                                alt=""
                                loading="lazy"
                                width={360}
                                decoding="async"
                                data-nimg={1}
                                classname="shrink-0"
                                src="manager-assign-ads.png"
                                style={{border: '1px solid white'}}
                            />
                        </div>
                        <div>
                            <h3 style={styles.font700white}>Advertiser Flow</h3>
                            <p style={styles.section3P}>Step 3: Assign ads</p>
                            <p style={styles.section3P}>
                                Step 4: Wait for the purchases and contact the customers!
                            </p>
                        </div>
                    </div>
                </div>
            </section>



            <section style={styles.section4}>
                <div
                    style={styles.section4Container}
                >
                    <div
                        style={styles.section4SubContainer}
                    >
                        <div>
                            <h3 style={styles.font700white}>Advertiser Flow</h3>
                            <p
                                style={styles.section3P}
                            >
                                After receiving the first purchases you are able to find customers
                                info and withdraw the money on Withdraw page.
                            </p>
                        </div>
                        <div style={{}}>
                            <img
                                alt=""
                                loading="lazy"
                                decoding="async"
                                data-nimg={1}
                                classname="shrink-0"
                                src="withdraw-page.png"
                                style={{ width: "100%" }}
                            />
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

const styles = {
    headImg: {
        borderRadius: '50%'
    },
    headImg2: {
        display: "block",
        width: "70%",
        borderRadius: 10,
        margin: "10px auto 20px"
    },
    headText: {
        fontSize: '2.5rem',
        lineHeight: '3.5rem',
        letterSpacing: '-.0625rem'
    },
    headContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: '900px'
    },
    section1: {
        background: '#2A183E',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        padding: '2rem'
    },

    section2: {
        display: "flex",
        paddingTop: "4rem",
        paddingBottom: "4rem",
        flexDirection: "column",
        gap: "5rem"
    },
    section_cotainer: {
        display: "flex", flexDirection: "column", alignItems: "center"
    },
    section_head_container: {
        display: "flex",
        paddingTop: "2.5rem",
        flexDirection: "row",
        gap: "2rem",
        maxWidth: 900
    },
    font700: { fontWeight: '700' },

    sectionSubHeading: {
        fontSize: "1.2em",
        lineHeight: "1.6",
        color: "rgb(102, 102, 102)",
        textAlign: "justify"
    },
    sectionOl: {
        fontSize: "1.2em",
        color: "rgb(102, 102, 102)",
        lineHeight: "1.8",
        paddingLeft: 20
    },
    dflexcenter: { display: "flex", alignItems: "center" },
    section3: {
        display: "flex",
        paddingTop: "4rem",
        paddingBottom: "4rem",
        flexDirection: "column",
        gap: "5rem",
        background: "#2a183e"
    },
    section3Container: {
        display: "flex",
        paddingTop: "2.5rem",
        flexDirection: "row",
        gap: "2rem",
        width: 900
    },
    font700white: { fontWeight: 700, color: "white" },
    section3P: { lineHeight: "1.6", color: "#dddddd", textAlign: "justify",fontSize: '1.2em' },
    section3imgContainer: {
        display: "flex",
        paddingTop: "2.5rem",
        flexDirection: "row",
        gap: "5rem",
        width: 900
    },
    section4: { display: "flex", flexDirection: "column", gap: "5rem" },
    section4Container: {
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        background: "#1f1f1f",
        padding: "6rem"
    },
    section4SubContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        maxWidth: 900
    },
    container: {
        margin: '0 auto',
        fontFamily: "'Nunito', sans-serif",
        backgroundColor:'white'
    },

};

export default Landing;
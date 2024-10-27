import React, { useState } from 'react';
import axios from 'axios';
import { usePolkadotContext } from '../context/PolkadotContext';

function CheckoutPage() {
    if (typeof window.location == 'undefined') return false;
    if (window.location.pathname.includes("checkout")) return true;

    return false;
}

const NavBar = () => {
    const { signerAddress, loadingContract } = usePolkadotContext();

    const [isCheckoutPage] = useState(CheckoutPage());

    async function ConnectWallet() {

        const polkadot = await import("@polkadot/extension-dapp");

        await polkadot.web3Enable("YT Purchase");
        const allAccounts = await polkadot.web3Accounts();
        if (allAccounts[0] != null) {
            window.localStorage.setItem("type", "polkadot");
            window.location.reload();
        }

    }

    async function logOut() {
        window.localStorage.removeItem("type");
        window.location.reload();
    }

    const logoutIcon = () => <svg
        xmlns="http://www.w3.org/2000/svg"
        width="800px"
        height="800px"
        viewBox="0 0 24 24"
        fill="none"
        onClick={logOut}
        style={styles.svg}
    >
        <path
            d="M21 12L13 12"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M18 15L20.913 12.087V12.087C20.961 12.039 20.961 11.961 20.913 11.913V11.913L18 9"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M16 5V4.5V4.5C16 3.67157 15.3284 3 14.5 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H14.5C15.3284 21 16 20.3284 16 19.5V19.5V19"
            stroke="white"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>

    return (

        <header style={styles.header}>
            <a href='/'>
                <img src='/favicon.svg' height={80} />

            </a>
            <nav style={styles.nav}>

                {!isCheckoutPage && <ul style={styles.leftUl}>
                    <li>
                        {signerAddress && <a style={styles.a} href='/'>Home</a>}
                    </li>
                    <li>
                        {signerAddress && <a style={styles.a} href='/manager'>Ad Manager</a>}
                    </li>
                    <li>
                        {signerAddress && <a style={styles.a} href='/withdraw'>Withdraw</a>}
                    </li>
                </ul>}
                <ul
                    className="nav justify-content-end"
                    style={styles.ul}
                >
                    <li className="nav-item">
                        {!signerAddress && <button disabled={loadingContract} style={styles.button} onClick={ConnectWallet}>
                            {loadingContract ? 'Loading...' : 'Connect Wallet'}
                        </button>}
                    </li>
                    <li>
                        {signerAddress && <div style={styles.connected}>{signerAddress} {logoutIcon()}</div>}
                    </li>
                    <li>
                        {signerAddress && <div></div>}
                    </li>
                </ul>
            </nav>
        </header>

    );
};

const styles = {
    header: {
        display: 'flex',
        padding: '1rem 2rem',
        gap: '1rem',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
        background: '#A299BE',
        color: 'var(--fg-header)',
        boxShadow: 'rgba(0, 0, 0, 0.16) 0px 12px 12px -6px'

    },
    leftUl: {
        float: 'left',
        listStyle: 'none',
        marginTop: '1rem',
        display: 'flex',
        gap: '1rem',
        color: 'black'
    },
    ul: {
        display: 'flex',
        flexWrap: 'wrap',
        paddingLeft: '0px',
        marginBottom: '0',
        marginTop: '0',
        listStyle: 'none',
        justifyContent: 'flex-end',
        float: "right",
        width:"100%"
    },
    connected: {
        background: 'rgb(42 24 62)',
        padding: '1rem',
        color: 'white',
        display: 'flex',
        borderRadius: '6px',
        gap: '1rem',
        alignItems: 'center'
    },
    svg: {
        width: '1.5rem',
        height: '1.5rem',
        cursor: 'pointer'
    },

    nav: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%"
    },
    button: {
        position: 'relative',
        alignItems: 'center',
        boxSizing: 'border-box',
        display: 'flex',
        height: '40px',
        justifyContent: 'center',
        margin: '0px',
        overflow: 'hidden',
        padding: '8px 16px',
        zIndex: '0',
        color: 'white',
        backgroundColor: 'rgb(42 24 62)',
        backgroundImage: 'none',
        border: "none",
        boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px inset, rgb(153, 156, 160) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0) 0px 0px 0px 0px',
        cursor: 'pointer',
        transitionDuration: '0.2s',
        transitionProperty: 'all',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        appearance: 'button',
        textRendering: 'auto',
        WebkitFontSmoothing: 'antialiased',
        borderRadius: '8px',
        gap: '8px',
        listStyle: 'outside none none',
        paddingBlock: '8px',
        paddingInline: '16px',
        userSelect: 'none'
    },
    a: {
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        zIndex: '0',
        padding: '0.5rem 1rem',
        gap: '0.5rem',
        justifyContent: 'center',
        alignItems: 'center',
        height: '2.5rem',
        fontWeight: '600',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        transitionProperty: 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDuration: '300ms, 200ms',
        userSelect: 'none',
        color: '#000000',
        fontSize: '1.1rem'
    },
};

export default NavBar;
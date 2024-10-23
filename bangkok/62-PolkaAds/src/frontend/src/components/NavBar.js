import React, {useState} from 'react';
import axios from 'axios';
import {usePolkadotContext} from '../context/PolkadotContext';

function CheckoutPage() {
    if (typeof window.location == 'undefined') return false;
    if (window.location.pathname.includes("checkout")) return true;

    return false;
}

const NavBar = () => {
    const {signerAddress, loadingContract} = usePolkadotContext();

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
        <nav
            style={styles.nav}
        >
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

    );
};

const styles = {
    nav: {
        backgroundColor: '#373F47',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: "'Poppins', sans-serif",
    },
    leftUl: {
        float: 'left',
        listStyle: 'none',
        marginTop: '1rem',
        display: 'flex',
        gap: '1rem'
    },
    ul: {
        display: 'flex',
        flexWrap: 'wrap',
        paddingLeft: '0px',
        marginBottom: '0',
        marginTop: '0',
        listStyle: 'none',
        justifyContent: 'flex-end',
        float: "right"
    },
    connected: {
        background: '#354860',
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

    header: {
        marginBottom: '15px',
        color: '#333',
        textAlign: 'center'
    },
    button: {
        backgroundColor: '#354860',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    a: {
        color: '#fff',
        textDecoration: 'none',
        margin: '0 15px',
        fontWeight: '500',
        fontSize: '1.1rem',
    },
};

export default NavBar;
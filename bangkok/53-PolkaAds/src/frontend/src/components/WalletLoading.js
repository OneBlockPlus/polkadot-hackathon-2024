import React, {useState} from 'react';
import axios from 'axios';
import {usePolkadotContext} from '../context/PolkadotContext';

const WalletLoading = ({children}) => {
    const {signerAddress, loadingContract} = usePolkadotContext();

    return (
        loadingContract || (!loadingContract && !signerAddress) ? <>
            <div style={styles.container}>{loadingContract ? <>Loading...</> : <>Please connect your wallet in order to
                continue</>}</div>
        </> : (signerAddress ? children : <>

        </>)
    );
};

const styles = {
    container: {
        padding: '18%',
        fontSize: '3rem',
        textAlign: 'center'
    },
};

export default WalletLoading;
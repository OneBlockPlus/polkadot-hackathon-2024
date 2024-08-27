import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { IPFSProvider } from '../contexts/IPFSContext';
import { PolkadotProvider } from '../contexts/PolkadotContext';
import { EnvironmentProvider } from '../contexts/EnvironmentContext';
import Header from '../components/layout/Header';
import '../public/css/daos.css';
import '../public/css/ideas.css';
import '../public/output.css';
import '../public/theme.css';
import web3Onboard from '../contexts/web3-onboard';
import { Web3OnboardProvider } from '@subwallet-connect/react';

function MyApp({ Component, pageProps }) {
  return (
    <IPFSProvider>
      <Web3OnboardProvider web3Onboard={web3Onboard}>
        <PolkadotProvider>
        <ToastContainer hideProgressBar={false}  position="top-right" autoClose={3000} newestOnTop={false} closeOnClick rtl={false} draggable pauseOnHover theme="light"/ >
          <EnvironmentProvider>
            <Header />
            <Component {...pageProps} />

          </EnvironmentProvider>
        </PolkadotProvider>
      </Web3OnboardProvider>
    </IPFSProvider>
  );
}

export default MyApp;

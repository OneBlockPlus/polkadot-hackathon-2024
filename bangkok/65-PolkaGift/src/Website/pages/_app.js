import { UtilsProvider } from '../contexts/UtilsContext';
import { IPFSProvider } from '../contexts/IPFSContext';
import { ToastContainer } from 'react-toastify';
import { MixedProvider } from '../contexts/MixedContext';
import { MoonbeamProvider } from '../contexts/MoonbeamContext';
import dynamic from 'next/dynamic'

import 'react-toastify/dist/ReactToastify.css';
import '../public/output.css';

function MyApp({ Component, pageProps }) {
  const PolkadotProvider = dynamic(async () => (await import('../contexts/PolkadotContext').then((mod) => mod.PolkadotProvider)), { ssr: false, })


  return <PolkadotProvider><MoonbeamProvider><MixedProvider><IPFSProvider>
    <UtilsProvider  ><Component {...pageProps} /></UtilsProvider>
    <ToastContainer hideProgressBar={false} position="top-right" autoClose={3000} newestOnTop={false} closeOnClick rtl={false} draggable pauseOnHover theme="light" />
  </IPFSProvider></MixedProvider></MoonbeamProvider></PolkadotProvider>
}

export default MyApp
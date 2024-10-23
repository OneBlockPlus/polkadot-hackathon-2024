import '../styles/index.scss';
import { UtilsProvider } from '../contexts/UtilsContext';
import { IPFSProvider } from '../contexts/IPFSContext';
import { ToastContainer } from 'react-toastify';
import dynamic from 'next/dynamic'


import 'react-toastify/dist/ReactToastify.css';
function MyApp({ Component, pageProps }) {
  const PolkadotProvider = dynamic(async () => (await import('../contexts/PolkadotContext').then((mod) => mod.PolkadotProvider)), { ssr: false, })


  return <PolkadotProvider><IPFSProvider>
    <UtilsProvider  ><Component {...pageProps} /></UtilsProvider>
    <ToastContainer hideProgressBar={false} position="top-right" autoClose={3000} newestOnTop={false} closeOnClick rtl={false} draggable pauseOnHover theme="light" />
  </IPFSProvider></PolkadotProvider>
}

export default MyApp
import Web3 from 'web3';
import Web3Modal from 'web3modal';

const providerOptions = {}; // You can configure specific providers here

export const getWeb3Modal = () => {
  return new Web3Modal({
    cacheProvider: true,
    providerOptions
  });
};

export const connectWallet = async () => {
  const web3Modal = getWeb3Modal();
  const provider = await web3Modal.connect();
  const web3 = new Web3(provider);
  return web3;
};

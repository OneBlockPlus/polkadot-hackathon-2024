import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { ArrowDownUp, DollarSign, Bitcoin } from 'lucide-react';
import { ConnectWallet } from '../components/ConnectWallet';
import { useWallet } from '../providers/WalletProvider';

type Asset = 'dUSDT' | 'dBTC';

const AssetIcon = ({ asset }: { asset: Asset }) => {
  switch (asset) {
    case 'dUSDT':
      return <DollarSign className="w-8 h-8 text-green-400" />;
    case 'dBTC':
      return <Bitcoin className="w-8 h-8 text-yellow-500" />;
  }
};

const WaveButton = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="w-full bg-[#FF2670] text-white px-8 py-5 rounded-md font-semibold hover:bg-opacity-80 transition-all duration-300 flex items-center justify-center text-xl relative overflow-hidden group"
  >
    <span className="relative z-10 flex items-center justify-center">{children}</span>
    <span className="absolute inset-0 bg-white opacity-25 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
  </button>
);

export const Swap = () => {
  const [fromAsset, setFromAsset] = useState<Asset>('dBTC');
  const [toAsset, setToAsset] = useState<Asset>('dUSDT');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [conversionRate, setConversionRate] = useState(1); 

  const { signer, account } = useWallet();

  const SWAP_CONTRACT_DOTFI = import.meta.env.VITE_SWAP_CONTRACT_DOTFI;
  const BTC_TOKEN_ADDRESS = import.meta.env.VITE_BTC_TOKEN_ADDRESS;
  const USDT_TOKEN_ADDRESS = import.meta.env.VITE_USDT_TOKEN_ADDRESS;

  useEffect(() => {
    if (signer && SWAP_CONTRACT_DOTFI) {
      const fetchPrice = async () => {
        try {
          const swapAbi = ['function getPrice(address fromToken, address toToken) public view returns (uint256)'];
          const swapContract = new ethers.Contract(SWAP_CONTRACT_DOTFI, swapAbi, signer);
          const price = await swapContract.getPrice(BTC_TOKEN_ADDRESS, USDT_TOKEN_ADDRESS);
          setConversionRate(parseFloat(ethers.formatUnits(price, 18))); 
        } catch (error) {
          console.error('Error fetching conversion rate:', error);
        }
      };

      fetchPrice();
    }
  }, [signer, SWAP_CONTRACT_DOTFI, BTC_TOKEN_ADDRESS, USDT_TOKEN_ADDRESS]);

  useEffect(() => {
    if (fromAmount !== '') {
      if (fromAsset === 'dBTC') {
        setToAmount((parseFloat(fromAmount) * conversionRate).toString());
      } else {
        setToAmount((parseFloat(fromAmount) / conversionRate).toString());
      }
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromAsset, conversionRate]);

  const handleSwap = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromAmount(e.target.value);
  };

  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToAmount(e.target.value);
    if (e.target.value !== '') {
      if (toAsset === 'dBTC') {
        setFromAmount((parseFloat(e.target.value) * conversionRate).toString());
      } else {
        setFromAmount((parseFloat(e.target.value) / conversionRate).toString());
      }
    } else {
      setFromAmount('');
    }
  };

  const handleSwapExecution = async () => {
    try {
      const swapAbi = ['function swap(address fromToken, address toToken, uint256 amount) public'];
      const swapContract = new ethers.Contract(SWAP_CONTRACT_DOTFI, swapAbi, signer);

      const amountInWei = ethers.parseUnits(fromAmount, 18);
      const fromTokenAddress = fromAsset === 'dBTC' ? BTC_TOKEN_ADDRESS : USDT_TOKEN_ADDRESS;
      const toTokenAddress = toAsset === 'dBTC' ? BTC_TOKEN_ADDRESS : USDT_TOKEN_ADDRESS;

      const tx = await swapContract.swap(fromTokenAddress, toTokenAddress, amountInWei);
      await tx.wait();

      alert('Swap successful!');
    } catch (error) {
      console.error('Error executing swap:', error);
      alert('Failed to execute swap.');
    }
  };

  if (!account) {
    return <ConnectWallet />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-xl w-full -mt-[10vh]"
      >
        <div className="absolute inset-0 bg-[#091a1f] bg-opacity-60 backdrop-blur-xl rounded-lg shadow-lg"></div>
        <motion.div
          className="relative z-10 px-10 py-10 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 z-0"
            animate={{
              background: [
                'radial-gradient(circle, rgba(255,38,112,0.1) 0%, rgba(9,26,31,0.1) 100%)',
                'radial-gradient(circle, rgba(9,26,31,0.1) 0%, rgba(255,38,112,0.1) 100%)',
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
          />
          <div className="relative z-10">
            <motion.h2
              className="text-4xl font-bold mb-8 text-center text-[#FFFFFF]"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Swap Assets
            </motion.h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="fromAsset" className="block text-lg font-medium text-gray-300 mb-3">
                  From
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    id="fromAmount"
                    value={fromAmount}
                    onChange={handleFromAmountChange}
                    className="w-2/3 px-6 py-5 bg-[#132a33] bg-opacity-50 text-white text-lg rounded-md focus:outline-none transition-all duration-300 focus:bg-opacity-75"
                    placeholder="0.00"
                  />
                  <div className="w-1/3 flex items-center justify-between px-6 py-5 bg-[#132a33] bg-opacity-50 rounded-md text-white">
                    <span className="flex items-center">
                      <AssetIcon asset={fromAsset} />
                      <span className="ml-3 text-lg">{fromAsset}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSwap}
                  className="bg-[#1F3A45] rounded-full p-3 hover:bg-[#FF2670] transition-colors duration-200"
                >
                  <ArrowDownUp className="h-6 w-6 text-white" />
                </button>
              </div>

              <div>
                <label htmlFor="toAsset" className="block text-lg font-medium text-gray-300 mb-3">
                  To
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    id="toAmount"
                    value={toAmount}
                    onChange={handleToAmountChange}
                    className="w-2/3 px-6 py-5 bg-[#132a33] bg-opacity-50 text-white text-lg rounded-md focus:outline-none transition-all duration-300 focus:bg-opacity-75"
                    placeholder="0.00"
                  />
                  <div className="w-1/3 flex items-center justify-between px-6 py-5 bg-[#132a33] bg-opacity-50 rounded-md text-white">
                    <span className="flex items-center">
                      <AssetIcon asset={toAsset} />
                      <span className="ml-3 text-lg">{toAsset}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <WaveButton onClick={handleSwapExecution}>
                Swap
              </WaveButton>
            </div>

            <div className="mt-4 text-center text-gray-400">
              <p>Conversion Rate: 1 dBTC = {conversionRate} dUSDT</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

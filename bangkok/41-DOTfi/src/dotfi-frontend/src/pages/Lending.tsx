import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { DollarSign, Info } from 'lucide-react';
import { ConnectWallet } from '../components/ConnectWallet';
import { useWallet } from '../providers/WalletProvider';

type Tab = 'borrow' | 'lend';

const TabButton = ({ tab, activeTab, onClick }: { tab: Tab, activeTab: Tab, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`text-lg font-medium transition-colors duration-300 ${
      activeTab === tab ? 'text-[#FF2670] border-b-2 border-[#FF2670]' : 'text-gray-400 hover:text-gray-200'
    }`}
  >
    {tab === 'borrow' ? 'Borrow' : 'Lend'}
  </button>
);

const WaveButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="w-full bg-[#FF2670] text-white px-8 py-5 rounded-md font-semibold hover:bg-opacity-80 transition-all duration-300 flex items-center justify-center text-xl relative overflow-hidden group"
  >
    <span className="relative z-10 flex items-center justify-center">{children}</span>
    <span className="absolute inset-0 bg-white opacity-25 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
  </button>
);

export const Lending = () => {
  const [activeTab, setActiveTab] = useState<Tab>('borrow');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [lendAmount, setLendAmount] = useState('');
  const [borrowRepaymentInfo, setBorrowRepaymentInfo] = useState({ daily: 0, monthly: 0, yearly: 0 });
  const [lendInterestInfo, setLendInterestInfo] = useState({ daily: 0, monthly: 0, yearly: 0 });
  const [collateralAmount, setCollateralAmount] = useState(0);

  const BTC_TO_USDT_RATE = 50000;
  const COLLATERAL_PERCENTAGE = 0.7;
  const BORROW_APR = 0.1;
  const LEND_APR = 0.08;

  const LENDING_CONTRACT_ADDRESS = import.meta.env.VITE_LENDING_CONTRACT_ADDRESS;
  const USDT_TOKEN_ADDRESS = import.meta.env.VITE_USDT_TOKEN_ADDRESS;
  const BTC_TOKEN_ADDRESS = import.meta.env.VITE_BTC_TOKEN_ADDRESS;

  const { signer, account, provider } = useWallet();

  useEffect(() => {
    if (borrowAmount) {
      const amount = parseFloat(borrowAmount);
      const dailyInterest = (amount * BORROW_APR) / 365;
      const monthlyInterest = dailyInterest * 30;
      const yearlyInterest = amount * BORROW_APR;

      setBorrowRepaymentInfo({
        daily: dailyInterest,
        monthly: monthlyInterest,
        yearly: yearlyInterest,
      });

      const requiredCollateral = amount / (BTC_TO_USDT_RATE * COLLATERAL_PERCENTAGE);
      setCollateralAmount(requiredCollateral);
    } else {
      setBorrowRepaymentInfo({ daily: 0, monthly: 0, yearly: 0 });
      setCollateralAmount(0);
    }
  }, [borrowAmount]);

  useEffect(() => {
    if (lendAmount) {
      const amount = parseFloat(lendAmount);
      const dailyInterest = (amount * LEND_APR) / 365;
      const monthlyInterest = dailyInterest * 30;
      const yearlyInterest = amount * LEND_APR;

      setLendInterestInfo({
        daily: dailyInterest,
        monthly: monthlyInterest,
        yearly: yearlyInterest,
      });
    } else {
      setLendInterestInfo({ daily: 0, monthly: 0, yearly: 0 });
    }
  }, [lendAmount]);

  const handleBorrow = async () => {
    if (!signer) {
      alert('Please connect your wallet.');
      return;
    }

    try {
      const lendingAbi = ['function depositAndBorrow(uint256 btcAmount) external', 'function setBTCPriceInUSD(uint256 _btcPriceInUSD) external'];
      const lendingContract = new ethers.Contract(LENDING_CONTRACT_ADDRESS, lendingAbi, signer);

      // Approve the lending contract to transfer user's dBTC as collateral
      const btcAbi = ['function approve(address spender, uint256 amount) public returns (bool)'];
      const btcContract = new ethers.Contract(BTC_TOKEN_ADDRESS, btcAbi, signer);

      const collateralInWei = ethers.utils.parseUnits(collateralAmount.toString(), 8);
      const approvalTx = await btcContract.approve(LENDING_CONTRACT_ADDRESS, collateralInWei);
      await approvalTx.wait();

      // Borrow USDT with the collateral
      const borrowTx = await lendingContract.depositAndBorrow(collateralInWei);
      await borrowTx.wait();

      alert('Borrow successful!');
    } catch (error) {
      console.error('Error during borrow:', error);
      alert('Failed to borrow.');
    }
  };

  const handleLend = async () => {
    if (!signer) {
      alert('Please connect your wallet.');
      return;
    }

    try {
      const usdtAbi = ['function approve(address spender, uint256 amount) public returns (bool)'];
      const lendingAbi = ['function depositLending(uint256 usdtAmount) external'];
      const lendingContract = new ethers.Contract(LENDING_CONTRACT_ADDRESS, lendingAbi, signer);

      const usdtContract = new ethers.Contract(USDT_TOKEN_ADDRESS, usdtAbi, signer);
      const lendAmountInWei = ethers.utils.parseUnits(lendAmount, 6); // Assuming USDT uses 6 decimals

      // Approve the lending contract to transfer user's USDT
      const approvalTx = await usdtContract.approve(LENDING_CONTRACT_ADDRESS, lendAmountInWei);
      await approvalTx.wait();

      // Deposit USDT for lending
      const lendTx = await lendingContract.depositLending(lendAmountInWei);
      await lendTx.wait();

      alert('Lending successful!');
    } catch (error) {
      console.error('Error during lend:', error);
      alert('Failed to lend.');
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
        <div className="absolute inset-0 bg-[#0A1A1F] bg-opacity-60 backdrop-blur-xl rounded-lg shadow-lg"></div>
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
              Borrow & Lend
            </motion.h2>

            <div className="flex justify-center space-x-8 mb-8">
              <TabButton tab="borrow" activeTab={activeTab} onClick={() => setActiveTab('borrow')} />
              <TabButton tab="lend" activeTab={activeTab} onClick={() => setActiveTab('lend')} />
            </div>

            {activeTab === 'borrow' && (
              <div className="space-y-6">
                <div className="bg-[#0F1E24] rounded-lg p-6 border border-[#1F3A45]">
                  <h3 className="text-xl font-bold text-white mb-4">Borrow Information</h3>
                  <ul className="text-white space-y-2">
                    <li>
                      <Info className="inline-block mr-2 text-[#FF2670]" size={16} /> Borrow up to 70% of your dBTC
                    </li>
                    <li>
                      <Info className="inline-block mr-2 text-[#FF2670]" size={16} /> 10% interest rate
                    </li>
                    <li>
                      <Info className="inline-block mr-2 text-[#FF2670]" size={16} /> 1 dBTC = 50,000 dUSDT
                    </li>
                  </ul>
                </div>

                <div className="bg-[#0F1E24] rounded-lg p-6 border border-[#1F3A45]">
                  <h3 className="text-xl font-bold text-white mb-4">Loan Calculator</h3>
                  <div className="mb-4">
                    <label htmlFor="borrowAmount" className="block text-sm font-medium text-gray-300 mb-2">
                      Borrow Amount (dUSDT)
                    </label>
                    <input
                      type="number"
                      id="borrowAmount"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      className="w-full px-6 py-5 bg-[#132a33] bg-opacity-50 text-white text-lg rounded-md focus:outline-none transition-all duration-300 focus:bg-opacity-75"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2 text-white">
                    <p>
                      Daily Repayment: <span className="font-bold">{borrowRepaymentInfo.daily.toFixed(2)} dUSDT</span>
                    </p>
                    <p>
                      Monthly Repayment: <span className="font-bold">{borrowRepaymentInfo.monthly.toFixed(2)} dUSDT</span>
                    </p>
                    <p>
                      Yearly Repayment: <span className="font-bold">{borrowRepaymentInfo.yearly.toFixed(2)} dUSDT</span>
                    </p>
                  </div>
                  <div className="mt-4 p-4 bg-[#FF2670] bg-opacity-20 rounded-md">
                    <p className="text-[#FF2670] font-bold">
                      Required Collateral: {collateralAmount.toFixed(8)} dBTC
                    </p>
                  </div>
                </div>

                <WaveButton onClick={handleBorrow}>
                  <DollarSign className="mr-2" />
                  Borrow dUSDT
                </WaveButton>
              </div>
            )}

            {activeTab === 'lend' && (
              <div className="space-y-6">
                <div className="bg-[#0F1E24] rounded-lg p-6 border border-[#1F3A45]">
                  <h3 className="text-xl font-bold text-white mb-4">Lending Information</h3>
                  <ul className="text-white space-y-2">
                    <li>
                      <Info className="inline-block mr-2 text-[#FF2670]" size={16} /> Earn 8% APR on your dUSDT
                    </li>
                    <li>
                      <Info className="inline-block mr-2 text-[#FF2670]" size={16} /> Interest accrues daily
                    </li>
                    <li>
                      <Info className="inline-block mr-2 text-[#FF2670]" size={16} /> Withdraw anytime
                    </li>
                  </ul>
                </div>

                <div className="bg-[#0F1E24] rounded-lg p-6 border border-[#1F3A45]">
                  <h3 className="text-xl font-bold text-white mb-4">Lending Calculator</h3>
                  <div className="mb-4">
                    <label htmlFor="lendAmount" className="block text-sm font-medium text-gray-300 mb-2">
                      Lend Amount (dUSDT)
                    </label>
                    <input
                      type="number"
                      id="lendAmount"
                      value={lendAmount}
                      onChange={(e) => setLendAmount(e.target.value)}
                      className="w-full px-6 py-5 bg-[#132a33] bg-opacity-50 text-white text-lg rounded-md focus:outline-none transition-all duration-300 focus:bg-opacity-75"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2 text-white">
                    <p>Daily Interest: <span className="font-bold">{lendInterestInfo.daily.toFixed(4)} dUSDT</span></p>
                    <p>Monthly Interest: <span className="font-bold">{lendInterestInfo.monthly.toFixed(2)} dUSDT</span></p>
                    <p>Yearly Interest: <span className="font-bold">{lendInterestInfo.yearly.toFixed(2)} dUSDT</span></p>
                  </div>
                </div>

                <WaveButton onClick={handleLend}>
                  <DollarSign className="mr-2" />
                  Lend dUSDT
                </WaveButton>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

import logo from './logo.svg';
import './App.css';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/Landing';
import Dashboard from './pages/DashBoard';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import {Contract } from 'ethers'
import { useEthers } from '@usedapp/core';
function App() {
  // const contract = new Contract(contractAddress, MintableERC20.abi);
  const { activateBrowserWallet, deactivate, account } = useEthers();

   // Handle the wallet toggle
   const handleWalletConnection = () => {
    if (account) deactivate();
    else activateBrowserWallet();
  };

  return (
    <div className="App">
      <Navbar />
        <AnimatePresence>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/staking' element={<Dashboard />} />
          
          </Routes>
        </AnimatePresence>
    </div>
  );
}

export default App;

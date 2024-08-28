import React, { createContext, useContext, useState, useEffect } from 'react';
import { useConnectWallet } from '@subwallet-connect/react';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (wallet) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [wallet]);

  return (
    <WalletContext.Provider value={{ wallet, connecting, connect, disconnect, isConnected }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);

import { createContext, useContext, useState, ReactNode } from "react"

interface WalletContextType {
  address: string;
  setAddress: (address: string) => void;
}

const defaultContextValue: WalletContextType = {
  address: '',
  setAddress: () => {},
};

const WalletContext = createContext<WalletContextType>(defaultContextValue);

export function useWallet() {
  return useContext(WalletContext);
}

interface WalletProviderProps {
  children: ReactNode;
}

export default function WalletProvider({ children }: WalletProviderProps) {
  const [address, setAddress] = useState('')

  const value: WalletContextType = {
    address,
    setAddress
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
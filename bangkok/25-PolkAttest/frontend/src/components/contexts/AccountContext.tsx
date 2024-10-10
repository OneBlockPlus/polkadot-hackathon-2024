import React, { createContext, useContext, useState, ReactNode } from "react";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";

// Define the type for an account object
interface Account {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

// Define the types for the context
interface WalletContextType {
  allAccounts: Account[];
  selectedAccount: string | null;
  handleConnectWallet: () => void;
  handleSelectAccount: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  formatAccount: (account: string) => string;
}

//Name of dapp
const NAME = "PolkAttest";

// Create the context with a default value
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Define the provider component
interface WalletProviderProps {
  children: ReactNode;
}

const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    const extensions = await web3Enable(NAME);

    if (!extensions) {
      throw new Error("No wallet installed found");
    }

    const localAccounts = await web3Accounts();
    setAllAccounts(localAccounts);

    console.log(allAccounts);
  };

  //SELECT ACCOUNT AFTER CONNECTING WALLET
  const handleSelectAccount = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAddress = event.target.value;
    const account = allAccounts.find(
      (acc: Account) => acc.address === selectedAddress
    );

    if (!account) {
      throw new Error("Account not found");
    }

    setSelectedAccount(account.address);
  };

  //SLICE ACCOUNT TO SHOW ONLY LAST 4 DIGITS AND # POINTS
  const formatAccount = (account: string) => {
    if (account && account.length > 4) {
      return `...${account.slice(-4)}`;
    }
    return account;
  };

  return (
    <WalletContext.Provider
      value={{
        allAccounts,
        selectedAccount,
        handleConnectWallet,
        handleSelectAccount,
        formatAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the WalletContext
const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export { WalletProvider, useWallet };

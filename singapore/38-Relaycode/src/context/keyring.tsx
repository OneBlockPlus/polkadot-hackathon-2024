import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { KeyringAddress } from "@polkadot/ui-keyring/types";
import uiKeyring from "@polkadot/ui-keyring";

interface KeyringContextValue {
  account: KeyringAddress | null;
}

const KeyringContext = createContext<KeyringContextValue>({ account: null });

export const useKeyring = () => {
  return useContext(KeyringContext);
};

interface KeyringProviderProps {
  children: ReactNode;
}

export const KeyringProvider = ({
  children,
}: KeyringProviderProps): JSX.Element => {
  const [account, setAccount] = useState<KeyringAddress | null>(null);

  useEffect(() => {
    try {
      uiKeyring.loadAll({ isDevelopment: true });
      const accounts = uiKeyring.getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (error) {
      console.error("Error initializing keyring:", error);
    }
  }, []);

  const value: KeyringContextValue = { account };

  return (
    <KeyringContext.Provider value={value}>{children}</KeyringContext.Provider>
  );
};

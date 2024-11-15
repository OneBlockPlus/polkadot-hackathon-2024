import { createContext, useContext, useState, ReactNode } from "react";

import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";


interface AccountsContextType {
  accounts: InjectedAccountWithMeta[] | null;
  setAccounts: (accounts: InjectedAccountWithMeta[] | null) => void;
  selectedAccount: InjectedAccountWithMeta | null;
  setSelectedAccount: (account: InjectedAccountWithMeta| null) => void;
}

const defaultContextValue: AccountsContextType = {
  accounts: null,
  setAccounts: () => {},
  selectedAccount: null,
  setSelectedAccount: () => {},
};

const AccountsContext = createContext<AccountsContextType>(defaultContextValue);

export function useAccountsContext() {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error(
      "useAccountsContext must be used within an AccountsProvider"
    );
  }
  return context;
}

interface AccountsProviderProps {
  children: ReactNode;
}

export default function AccountsProvider({ children }: AccountsProviderProps) {
  const [selectedAccount, setSelectedAccount] =
    useState<InjectedAccountWithMeta | null>(null);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[] | null>(null);

  const value: AccountsContextType = {
    selectedAccount,
    setSelectedAccount,
    accounts,
    setAccounts,
    // accounts, actingAccount, injector
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
}

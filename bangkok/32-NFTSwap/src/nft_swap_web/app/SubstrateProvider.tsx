/*
 * @Descripttion:
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-10-05 11:38:06
 * @LastEditors: Hesin
 * @LastEditTime: 2024-10-08 11:20:35
 */
// api/SubstrateProvider.tsx
"use client";

import React, { createContext, useState, ReactNode, useEffect } from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";
import {
  InjectedExtension,
  InjectedAccount,
} from "@polkadot/extension-inject/types";
const RPC_URL = "ws://127.0.0.1:9944";

interface SubstrateContextProps {
  api: ApiPromise | undefined;
  setApi: React.Dispatch<React.SetStateAction<ApiPromise | undefined>>;
  injector: InjectedExtension | undefined;
  setInjector: React.Dispatch<
    React.SetStateAction<InjectedExtension | undefined>
  >;
  allAccounts: InjectedAccount[];
  setAllAccounts: React.Dispatch<React.SetStateAction<InjectedAccount[]>>;
  extensionEnabled: boolean;
  setExtensionEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  nfts: any[];
  setNfts: React.Dispatch<React.SetStateAction<any[]>>;
  recvOffer: any[];
  setRecvOffer: React.Dispatch<React.SetStateAction<any[]>>;
  issuedOffer: any[];
  setIssuedOffer: React.Dispatch<React.SetStateAction<any[]>>;
  initConnection: () => Promise<ApiPromise>;
  pending: boolean; 
  setPending: React.Dispatch<React.SetStateAction<boolean>>; 
}

const SubstrateContext = createContext<SubstrateContextProps | undefined>(
  undefined
);

interface SubstrateProviderProps {
  children: ReactNode;
}

export const SubstrateProvider: React.FC<SubstrateProviderProps> = ({
  children,
}) => {
  const [api, setApi] = useState<ApiPromise | undefined>(undefined);
  const [injector, setInjector] = useState<InjectedExtension | undefined>(
    undefined
  );
  const [allAccounts, setAllAccounts] = useState<InjectedAccount[]>([]);
  const [extensionEnabled, setExtensionEnabled] = useState<boolean>(false);
  const [nfts, setNfts] = useState<any[]>([]);
  const [recvOffer, setRecvOffer] = useState<any[]>([]);
  const [issuedOffer, setIssuedOffer] = useState<any[]>([]);
  const [pending, setPending] = useState<boolean>(false);

  const initConnection = async () => {
    const provider = new WsProvider(RPC_URL);
    const _api = await ApiPromise.create({ provider, types: {} });
    setApi(_api);
    return _api;
  };

  const value = {
    api,
    setApi,
    injector,
    setInjector,
    allAccounts,
    setAllAccounts,
    extensionEnabled,
    setExtensionEnabled,
    nfts,
    setNfts,
    recvOffer,
    setRecvOffer,
    issuedOffer,
    setIssuedOffer,
    initConnection,
    pending,
    setPending,
  };

  return (
    <SubstrateContext.Provider value={value}>
      {children}
    </SubstrateContext.Provider>
  );
};

export const useSubstrateContext = (): SubstrateContextProps => {
  const context = React.useContext(SubstrateContext);
  if (!context) {
    throw new Error(
      "useSubstrateContext must be used within a SubstrateProvider"
    );
  }
  return context;
};

export const useAccount = (): InjectedAccount | null => {
  const { allAccounts } = useSubstrateContext();
  return allAccounts.length > 0 ? allAccounts[0] : null;
};

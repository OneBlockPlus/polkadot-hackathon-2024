import React, { createContext, useContext, useState, useEffect } from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3FromAddress, web3Enable } from "@polkadot/extension-dapp";
import { Signer } from "@polkadot/api/types";
import { Option, StorageKey } from "@polkadot/types";
import { SubmittableExtrinsicFunction } from "@polkadot/api/promise/types";
import { Codec } from "@polkadot/types/types";
import { u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";

export type SchemaField = {
  name: string;
  dataType: string;
  value: string;
};

export type SchemaData = {
  id?: string;
  issuer?: string;
  name: string;
  fields: SchemaField[];
};

export type AttestationData = {
  id?: string;
  schemaId?: number;
  subject?: string;
  issuer?: string;
  data: SchemaField[];
};

interface ApiContextType {
  api: ApiPromise | null;
  isQueryLoading: boolean;
  isTransactionLoading: boolean;
  sendTransaction: (
    selectedAccount: string,
    transaction: SubmittableExtrinsicFunction,
    params: SchemaData[] | AttestationData[]
  ) => Promise<void>;
  getById: (
    queryFunction: (id: number) => Promise<Option<Codec>>,
    id: number
  ) => Promise<any>;
  getAll: (
    queryFunction: () => Promise<[StorageKey, Option<Codec>][]>
  ) => Promise<any[]>;
  getAllByIssuer: (
    queryFunction: () => Promise<[StorageKey, Option<Codec>][]>,
    issuerAddress: string
  ) => Promise<any[]>;
}

const ApiContext = createContext<ApiContextType>({
  api: null,
  isQueryLoading: false,
  isTransactionLoading: false,
  sendTransaction: async () => {},
  getById: async () => null,
  getAll: async () => [],
  getAllByIssuer: async () => [],
});

export const useApi = () => useContext(ApiContext);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isQueryLoading, setQueryLoading] = useState<boolean>(false);
  const [isTransactionLoading, setTransactionLoading] =
    useState<boolean>(false);

  useEffect(() => {
    const initializeApi = async () => {
      const wsProvider = new WsProvider(
        import.meta.env.VITE_WS_RPC_ENDPOINT || ""
      );
      const apiInstance = await ApiPromise.create({ provider: wsProvider });
      setApi(apiInstance);
    };
    initializeApi();
  }, []);

  const sendTransaction = async (
    selectedAccount: string,
    transaction: SubmittableExtrinsicFunction,
    params: SchemaData[] | AttestationData[]
  ): Promise<void> => {
    try {
      setTransactionLoading(true);
      const extensions = await web3Enable("Polkattest");
      if (extensions.length === 0) {
        throw new Error(
          "No extension found. Please install Polkadot{.js} or Talisman."
        );
      }
      const signer = (await web3FromAddress(selectedAccount)).signer as Signer;
      const unsub = await transaction(...params).signAndSend(
        selectedAccount,
        { signer },
        ({ status, dispatchError }) => {
          if (status.isInBlock) {
            console.log(
              `Transaction included at blockHash ${status.asInBlock}`
            );
            setTransactionLoading(false);
            if (dispatchError) {
              if (dispatchError.isModule) {
                const decoded = api?.registry.findMetaError(
                  dispatchError.asModule
                );
                const { name, section } = decoded!;
                console.error(`${section}.${name}`);
              } else {
                console.error(dispatchError.toString());
              }
            }
          } else if (status.isFinalized) {
            console.log(
              `Transaction finalized at blockHash ${status.asFinalized}`
            );
            unsub();
          }
        }
      );
    } catch (error) {
      console.error("Error during transaction:", error);
      setTransactionLoading(false);
      throw error;
    }
  };

  const getAll = async (
    queryFunction: () => Promise<[StorageKey, Option<Codec>][]>
  ): Promise<any[]> => {
    try {
      setQueryLoading(true);
      const entries = await queryFunction();
      const decodedEntries = entries
        .map(([key, option]) => {
          if (option.isSome) {
            const data = option.unwrap() as any;
            return {
              id: key.args[0].toHuman() as string,
              ...data.toHuman(),
            };
          }
          return null;
        })
        .filter((entry): entry is any => entry !== null);
      return decodedEntries;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    } finally {
      setQueryLoading(false);
    }
  };

  const getAllByIssuer = async (
    queryFunction: () => Promise<[StorageKey, Option<Codec>][]>,
    issuerAddress: string
  ): Promise<SchemaData[]> => {
    try {
      setQueryLoading(true);
      const entries = await queryFunction();
      const hexIssuer = u8aToHex(decodeAddress(issuerAddress));
      const filteredEntries = entries
        .map(([key, option]) => {
          if (option.isSome) {
            const data = option.unwrap() as any;
            return {
              id: key.args[0].toHuman() as string,
              ...data.toHuman(),
            };
          }
          return null;
        })
        .filter(
          (entry): entry is SchemaData =>
            entry !== null && entry.issuer === hexIssuer
        );
      return filteredEntries;
    } catch (error) {
      console.error("Error fetching data by issuer:", error);
      throw error;
    } finally {
      setQueryLoading(false);
    }
  };

  const getById = async (
    queryFunction: (id: number) => Promise<Option<Codec>>,
    id: number
  ): Promise<any> => {
    try {
      setQueryLoading(true);
      const data = await queryFunction(id);
      return data.isSome ? data.unwrap().toHuman() : null;
    } catch (error) {
      console.error("Error fetching data by ID:", error);
      throw error;
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <ApiContext.Provider
      value={{
        api,
        isQueryLoading,
        isTransactionLoading,
        sendTransaction,
        getById,
        getAll,
        getAllByIssuer,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

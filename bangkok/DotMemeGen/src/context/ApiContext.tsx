"use client";
import React, { useContext, useEffect, useState } from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { chainProperties } from "../utils/networkConstants";
import { NotificationStatus } from "../types";
import queueNotification from "../components/QueueNotification";

interface Args {
  api: null | ApiPromise;
  ss58Format: number;
  decimals: number;
  network: string;
  setNetwork: (pre: string) => void;
  apiReady?: boolean;
  setRPCEndpoint?: (pre: string) => void;
  rpcEndpoint?: string;
}
export const ApiContext = React.createContext<Args>({
  api: null,
  ss58Format: 0,
  decimals: 10,
  network: "polkadot",
  setNetwork: () => {},
});

export function ApiContextProvider(props: any) {
  const { children = null } = props;
  const [network, setNetwork] = useState<string>(
    process.env.PUBLIC_NETWORK || "polkadot",
  );
  const [rpcEndpoint, setRPCEndpoint] = useState("");
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [apiReady, setApiReady] = useState(false);
  const [ss58Format, setSS58Format] = useState(0);
  const [decimals, setDecimals] = useState(10);

  useEffect(() => {
    setRPCEndpoint(chainProperties[network]?.rpcEndpoint);
    setSS58Format(chainProperties[network].ss58Format);
    setDecimals(chainProperties[network].tokenDecimals);
  }, [network]);

  console.log({ rpcEndpoint, network });

  useEffect(() => {
    (async () => {
      let api: ApiPromise | null = null;
      try {
        setApiReady(false);
        if (!rpcEndpoint) {
          return;
        }
        const provider = new WsProvider(rpcEndpoint);
        api = await ApiPromise.create({ provider });
        console.log("API created using rpc endpoint ", rpcEndpoint);
        setApi(api);
        api?.on("error", (error: string) => {
          console.log("Error from api: ", error);
          api.disconnect();
          setApi(null);
          setRPCEndpoint("");
          queueNotification({
            header: "Error!",
            message: "RPC connection error.",
            status: NotificationStatus.ERROR,
          });
        });
        api?.isReady
          ?.then(() => {
            setApiReady(true);
            console.log("API is ready");
          })
          .catch((error: string) => {
            console.log(error);
            api.disconnect();
            setApi(null);
            setRPCEndpoint("");
            queueNotification({
              header: "Error!",
              message: "RPC connection error.",
              status: NotificationStatus.ERROR,
            });
          });
      } catch (error) {
        console.log("Error while creating API: ", error);
        if (api) {
          api?.disconnect();
        }
        setApi(null);
        setRPCEndpoint("");
        queueNotification({
          header: "Error!",
          message: "RPC connection error.",
          status: NotificationStatus.ERROR,
        });
      }
    })();
  }, [rpcEndpoint]);

  return (
    <ApiContext.Provider
      value={{
        api,
        apiReady,
        ss58Format,
        decimals,
        network,
        setNetwork,
        setRPCEndpoint,
        rpcEndpoint,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}

export const useApiContext = () => {
  return useContext(ApiContext);
};

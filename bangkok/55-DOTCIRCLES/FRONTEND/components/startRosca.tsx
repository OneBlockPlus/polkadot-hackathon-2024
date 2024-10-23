"use client";

import { useState, useEffect } from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";

import { myAddress } from "@/app/lib/mock";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";

import { Button } from "@nextui-org/button";
import { redirect } from "next/navigation";

export default function StartRoscaBtn({ roscaId, startable }: any) {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);

  useEffect(() => {
    const initApi = async () => {
      try {
        // Initialize the provider to connect to the node
        const provider = new WsProvider(process.env.NEXT_PUBLIC_RPC);

        // Create the API and wait until ready
        const api = await ApiPromise.create({ provider });
        await api.isReady;

        // Update state
        setApi(api);
        setIsApiReady(true);
      } catch (error) {
        console.error("Failed to initialize API", error);
      }
    };

    initApi();

    // Cleanup when the component unmounts
    return () => {
      if (api) {
        api.disconnect();
      }
    };
  }, []);

  const handleStart = async () => {
    if (!isApiReady) {
      console.log("API is not ready");
      return;
    }

    try {
      const extensions = await web3Enable("DOTCIRCLES");
      const acc = await web3FromAddress(myAddress);
      // Replace with your actual extrinsic submission logic
      const tx = api!.tx.rosca.startRosca(roscaId);

      const hash = await tx.signAndSend(myAddress, {
        signer: acc.signer,
        nonce: -1,
      });
    } catch (error) {
      console.error("Failed to submit extrinsic", error);
    }
  };
  return (
    <Button
      onClick={handleStart}
      className={`w-6/12 text-white`}
      isDisabled={!startable}
      color={startable ? "success" : "default"}
    >
      {startable ? "Start" : "Waiting For Participants"}
    </Button>
  );
}

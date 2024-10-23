"use client";

import { FC, useEffect, useState } from "react";

import { ContractIds } from "@/deployments/deployments";
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from "@scio-labs/use-inkathon";
import toast from "react-hot-toast";

export const GreeterContractInteractions: FC = () => {
  const { api, activeAccount, activeSigner } = useInkathon();
  const { contract, address: contractAddress } = useRegisteredContract(
    ContractIds.Oracle,
    "pop-network-testnet",
  );

  const [price, setPrice] = useState<string>();
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>();

  // Fetch Price
  const fetchingPrice = async () => {
    if (!contract || !api) return;

    setFetchIsLoading(true);
    try {
      const result = await contractQuery(api, "", contract, "getPrice");
      const { output, isError, decodedOutput } = decodeOutput(
        result,
        contract,
        "getPrice",
      );
      if (isError) throw new Error(decodedOutput);
      setPrice(output);
    } catch (e) {
      console.error(e);
      toast.error("Error while fetching Price. Try again…");
      setPrice(undefined);
    } finally {
      setFetchIsLoading(false);
    }
  };
  useEffect(() => {
    fetchingPrice();
  }, [contract]);

  if (!api) return null;

  return (
    <>
      <div className="flex gap-1">
        <h2 className="text-center font-mono text-gray-400">Current price:</h2>
        {fetchIsLoading || !contract ? "Loading…" : price}
      </div>
    </>
  );
};

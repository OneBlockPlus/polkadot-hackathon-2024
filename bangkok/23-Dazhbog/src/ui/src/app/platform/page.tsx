"use client";

import { useEffect, useState } from "react";

import { ContractIds } from "@/deployments/deployments";
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from "@scio-labs/use-inkathon";

import { ChartExample } from "@/components/ui/candlestickChart";
import PositionCard from "@/components/ui/positionCard";
import PositionDoing from "@/components/ui/positionDoing";

export default function HomePage() {
  const { api, activeAccount, activeSigner } = useInkathon();
  const { contract, address: contractAddress } = useRegisteredContract(
    ContractIds.Manager,
    "pop-network-testnet",
  );

  const [positions, setPositions] = useState<any[]>([]);
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>();

  // Fetch Positions
  const fetchPositions = async () => {
    if (!contract || !api) return;
    let positions = [];
    const positionIds = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    setFetchIsLoading(true);
    for (const id of positionIds) {
      try {
        const result = await contractQuery(
          api,
          "",
          contract,
          "getPosition",
          {},
          ["15ypQ3FwDomkjWVv4DhgixaBehXN8NNgfbgaEn3LuW3Ey47w", id],
        );
        const { output, isError, decodedOutput } = decodeOutput(
          result,
          contract,
          "getPosition",
        );
        if (isError) throw new Error(decodedOutput);
        output?.Ok && positions.push({ ...output?.Ok, id });
      } catch (e) {
        console.error(e);
      }
    }
    setPositions(positions);
    setFetchIsLoading(false);
  };

  useEffect(() => {
    // Fetch positions
    fetchPositions();
  }, [contract]);

  return (
    <>
      <div className="relative flex h-full w-full grow flex-col-reverse items-center justify-start bg-slate-900/40 md:flex-row">
        <ChartExample />
        <div className="flex h-full flex-col gap-2 bg-slate-900/40 px-4 py-4 max-md:w-full md:min-w-[20%]">
          <PositionDoing refetchPosition={fetchPositions}/>
         {fetchIsLoading && <p>Loading...</p>}
          {positions.length > 0  && (
            <div className="relative flex h-fit max-h-[450px] w-full flex-col gap-2 overflow-auto">
              <div className="flex w-full items-center justify-start text-center font-mono text-gray-400">
                Your positions:
              </div>
              {positions.map((position: any) => (
                <PositionCard
                key={Number(`${position?.id}`.replace(/,/g, ""))}
                  type={position.positionType}
                  id={Number(`${position?.id}`.replace(/,/g, ""))}
                  value={Number(`${position?.positionValue}`.replace(/,/g, ""))}
                  leverage={Number(`${position?.leverage}`.replace(/,/g, ""))}
                  amount={Number(`${position?.amount}`.replace(/,/g, ""))}
                  date={Date.now()}
                  refetchPosition={fetchPositions}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

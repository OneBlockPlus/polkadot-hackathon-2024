import { useApi } from "@/state/api";
import { useEffect, useState } from "react";

export const useBestNumber = () => {
  const api = useApi();
  const [bestNumber, setBestNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!api) return;
    api.rpc.chain.subscribeNewHeads((header) => {
      setBestNumber(header.number.toNumber());
    });
  }, [api]);

  return bestNumber;
};

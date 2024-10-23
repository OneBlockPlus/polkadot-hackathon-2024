import { useAppStore } from "@/state/store";
import { useMemo } from "react";

export const useTxRequest = (requestId?: string) => {
  const txRequests = useAppStore((state) => state.txRequests);

  return useMemo(() => {
    if (!requestId) return undefined;
    return txRequests.find((txRequest) => txRequest.id === requestId);
  }, [requestId, txRequests]);
};

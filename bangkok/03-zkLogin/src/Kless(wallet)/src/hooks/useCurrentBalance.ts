import { balanceAtom } from "@/state/balance";
import { useAtomValue } from "jotai";

export const useCurrentBalance = () => {
  return useAtomValue(balanceAtom);
};

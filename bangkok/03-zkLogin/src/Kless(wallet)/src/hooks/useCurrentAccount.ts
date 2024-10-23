import { useAllAccounts } from "./useAllAccounts";

const selectCurrentAccount = (data: any) => {
  if (!data) {
    return null;
  }
  return (data as any[]).find((account) => account.selected);
};

export const useCurrentAccount = ({
  enabled = false,
}: { enabled?: boolean } = {}) => {
  return useAllAccounts({ enabled, select: selectCurrentAccount });
};

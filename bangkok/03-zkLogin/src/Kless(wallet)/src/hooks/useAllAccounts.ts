import { getDB } from "@/background/db";
import { useQuery } from "@tanstack/react-query";

export const useAllAccounts = ({
  enabled = false,
  select,
}: { enabled?: boolean; select?: (data: any) => any } = {}) => {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const db = await getDB();
      return db.accounts.toCollection().sortBy("createdAt");
    },
    select,
    enabled,
  });
};

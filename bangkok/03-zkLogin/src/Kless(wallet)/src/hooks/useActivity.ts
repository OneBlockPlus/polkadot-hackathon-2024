import { useEffect, useState } from "react";
import { useBestNumber } from "./useBestNumber";
import { getDB } from "@/background/db";
import { useApi } from "@/state/api";

export const useActivity = (address?: string) => {
  const bestNumber = useBestNumber();
  const api = useApi();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!api || !address) return;
    getDB()
      .then((db) => {
        return db.transfer
          .where("genesisHash")
          .equals(api.genesisHash.toHex())
          .toArray();
      })
      .then((transfers) => {
        return transfers
          .filter((item) => {
            return item.from === address || item.to === address;
          })
          .sort((a, b) => b.blockNumber - a.blockNumber);
      })
      .then((transfers) => {
        setActivities(transfers);
      });
  }, [bestNumber, api, address]);

  return activities;
};

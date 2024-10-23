import { ApiPromise } from "@polkadot/api";
import { useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAllAccounts } from "./hooks/useAllAccounts";
import { useCurrentAccount } from "./hooks/useCurrentAccount";
import { useApi, useSetApi } from "./state/api";
import { balanceAtom } from "./state/balance";
import { getDB } from "./background/db";
import { getTransfer } from "./lib/getTransfer";
import { useBestNumber } from "./hooks/useBestNumber";

export const Updater = () => {
  const { isFetching, data: accounts } = useAllAccounts({
    enabled: true,
  });
  const { data: account } = useCurrentAccount();

  const location = useLocation();
  const navigate = useNavigate();
  const setBalance = useSetAtom(balanceAtom);
  const setApi = useSetApi();
  const api = useApi();
  const apiInProcess = useRef(false);
  const bestNumber = useBestNumber();

  useEffect(() => {
    if (
      !isFetching &&
      (!accounts || !accounts.length) &&
      location.pathname !== "/welcome"
    ) {
      navigate("/welcome");
    }
  }, [location, isFetching, accounts, navigate]);

  useEffect(() => {
    if (!apiInProcess.current) {
      apiInProcess.current = true;
      ApiPromise.create().then((api) => {
        setApi(api);
      });
    }
  }, [setApi]);

  useEffect(() => {
    if (!api || !account?.address) return;
    api.query.system.account(account.address, (data: any) => {
      setBalance(BigInt((data as any).data.free.toBigInt()));
    });
  }, [account?.address, api, setBalance]);

  const balanceHistory = useCallback(
    async (api: ApiPromise) => {
      const db = await getDB();
      const genesisHash = api.genesisHash.toHex();

      const currentBlock = await db.lastHead
        .where("id")
        .equals(genesisHash)
        .first();

      let currentBlockNumber = currentBlock?.blockNumber || 1;

      while (bestNumber && bestNumber > currentBlockNumber) {
        const result = await getTransfer(api, currentBlockNumber + 1);
        if (result.length) {
          console.log("put transfer", result);
          await db.transfer.bulkPut(result);
        }
        await db.lastHead.put({
          id: genesisHash,
          blockNumber: currentBlockNumber + 1,
        });
        currentBlockNumber = currentBlockNumber + 1;
      }
    },
    [bestNumber]
  );

  useEffect(() => {
    if (!api) return;
    balanceHistory(api);
  }, [api, balanceHistory]);

  return null;
};

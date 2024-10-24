"use client";

import { ApiPromise } from "@polkadot/api";
import { SubmittableExtrinsic } from "@polkadot/api/types";

interface Args {
  api: ApiPromise;
  apiReady: boolean;
  network: string;
  tx: SubmittableExtrinsic<"promise">;
  address: string;
  proxyAddress?: string;
  params?: any;
  errorMessageFallback: string;
  onSuccess: (pre?: any) => Promise<void> | void;
  onFailed: (errorMessageFallback: string, sec?: any) => Promise<void> | void;
  onBroadcast?: () => void;
  setStatus?: (pre: string) => void;
  setIsTxFinalized?: (pre: string) => void;
  waitTillFinalizedHash?: boolean;
}

const executeTx = async ({
  api,
  apiReady,
  network,
  tx,
  address,
  params = {},
  errorMessageFallback,
  onSuccess,
  onFailed,
  onBroadcast,
  setStatus,
}: Args) => {
  if (!api || !apiReady || !tx) return;
  tx.signAndSend(address, params, async ({ status, events, txHash }: any) => {
    if (status.isInvalid) {
      console.log("Transaction invalid");
      setStatus?.("Transaction invalid");
    } else if (status.isReady) {
      console.log("Transaction is ready");
      setStatus?.("Transaction is ready");
    } else if (status.isBroadcast) {
      console.log("Transaction has been broadcasted");
      setStatus?.("Transaction has been broadcasted");
      onBroadcast?.();
    } else if (status.isInBlock) {
      console.log("Transaction is in block");
      setStatus?.("Transaction is in block");

      for (const { event } of events) {
        if (event.method === "ExtrinsicSuccess") {
          setStatus?.("Transaction Success");
          await onSuccess(txHash);
        } else if (event.method === "ExtrinsicFailed") {
          setStatus?.("Transaction failed");
          console.log("Transaction failed");
          setStatus?.("Transaction failed");
          const dispatchError = event.data?.dispatchError;

          if (dispatchError?.isModule) {
            const errorModule = event.data?.dispatchError?.asModule;
            const { method, section, docs } =
              api.registry.findMetaError(errorModule);
            errorMessageFallback = `${section}.${method} : ${docs.join(" ")}`;
            console.log(errorMessageFallback, "error module");
            await onFailed(errorMessageFallback, txHash);
          } else if (dispatchError?.isToken) {
            console.log(`${dispatchError.type}.${dispatchError.asToken.type}`);
            await onFailed(
              `${dispatchError.type}.${dispatchError.asToken.type}`,
              txHash,
            );
          } else {
            await onFailed(
              `${dispatchError.type}` || errorMessageFallback,
              txHash,
            );
          }
        }
      }
    } else if (status.isFinalized) {
      console.log(
        `Transaction has been included in blockHash ${status.asFinalized.toHex()}`,
      );
      console.log(`tx: https://${network}.subscan.io/extrinsic/${txHash}`);
    }
  }).catch((error) => {
    console.log(":( transaction failed");
    setStatus?.(":( transaction failed");
    console.error("ERROR:", error);
    onFailed(error?.toString?.() || errorMessageFallback);
  });
};
export default executeTx;

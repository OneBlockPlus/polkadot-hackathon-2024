/*
 * @Descripttion: 
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-10-15 00:02:40
 * @LastEditors: Hesin
 * @LastEditTime: 2024-10-22 12:48:09
 */
import { toast } from "@/hooks/use-toast";

export async function sendAndWait(api, tx, signer, extensionEnabled, injector) {
  console.log("sendAndWait", tx);
  console.log("sendAndWait", signer);
  console.log("sendAndWait", extensionEnabled);
  console.log("sendAndWait", injector);

  return new Promise((resolve, reject) => {
    const process = ({ status, events, dispatchError }) => {
      if (dispatchError) {
        if (dispatchError.isModule) {
          const decoded = api.registry.findMetaError(dispatchError.asModule);
          const { name, docs } = decoded;
          reject(new Error(`Transaction failed: ${name} - ${docs.join(" ")}`));
        } else {
          reject(new Error(`Transaction failed: ${dispatchError.toString()}`));
        }
      } else if (status.isInBlock) {
        console.log(`Transaction included at blockHash ${status.asInBlock}`);
      } else if (status.isFinalized) {
        console.log(`Transaction finalized at blockHash ${status.asFinalized}`);
        resolve(status.asFinalized);
      }
    };

    const signAndSend = async () => {
      if (extensionEnabled && injector) {
        try {
          return await tx.signAndSend(
            signer.address,
            {
              signer: injector.signer,
            },
            process
          );
        } catch (e: any) {
          console.log("error", e.message);
          reject(e.message);
        }
      } else {
        return await tx.signAndSend(signer, process);
      }
    };
    signAndSend();
  });
}

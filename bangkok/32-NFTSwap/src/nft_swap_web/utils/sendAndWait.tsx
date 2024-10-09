export async function sendAndWait(api, tx, signer, extensionEnabled, injector) {
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
        return await tx.signAndSend(
          signer.address,
          {
            signer: injector.signer,
          },
          process
        );
      } else {
        return await tx.signAndSend(signer, process);
      }
    };

    signAndSend();
  });
}

import { ApiPromise } from '@polkadot/api';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { web3FromAddress } from "@polkadot/extension-dapp";

interface CollectionResult {
  collectionId: string;
  creator: string;
  owner: string;
  blockHash: string;
}

export const createCollection = async (
  api: ApiPromise,
  selectedAccount: InjectedAccountWithMeta
): Promise<CollectionResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Starting collection creation...");

      // Get injector
      const injector = await web3FromAddress(selectedAccount.address);
      console.log("Got injector:", injector.name);

      if (!injector?.signer) {
        throw new Error("No signer found");
      }

      // Set the signer
      // api.setSigner(injector.signer);

      // Log available methods for debugging
      console.log("Available methods:", Object.keys(api.tx.nfts));

      // Try to get next collection ID
      try {
        const nextCollectionId = await api.query.nfts.nextCollectionId();
        console.log("Next collection ID:", nextCollectionId.toString());
      } catch (error) {
        console.log("Could not get next collection ID:", error);
      }

      // Create collection with just settings parameter
      // const tx = api.tx.nfts.create(
      //   selectedAccount.address,
      //   0  // settings as a simple number
      // );
      

      // console.log("Transaction created:", tx.method.toHex());

      // Sign and send
      const unsub = await api.tx.nfts.create( selectedAccount.address,
        { signer: injector.signer }).signAndSend(
          selectedAccount.address,
          ({ status, events, dispatchError }) =>{
          console.log(`Transaction status: ${status.type}`);

          if (dispatchError) {
            if (dispatchError.isModule) {
              try {
                const decoded = api.registry.findMetaError(
                  dispatchError.asModule
                );
                const { docs, name, section } = decoded;
                const errorMessage = `${section}.${name}: ${docs.join(" ")}`;
                console.error("Error:", errorMessage);
                reject(new Error(errorMessage));
              } catch (err) {
                console.error("Error decoding dispatch error:", err);
                reject(dispatchError);
              }
            } else {
              console.error(`Error: ${dispatchError.toString()}`);
              reject(new Error(dispatchError.toString()));
            }
            unsub();
            return;
          }

          if (status.isInBlock) {
            console.log(`Included at block hash: ${status.asInBlock}`);
            console.log("Processing events...");
            
            events.forEach(({ event: { data } }, index) => {
              console.log(`Event data ${index}:`, data.toString());

              // Wait for the third event which should be CollectionCreated
              if (index === 2) {
                const collectionId = data[0];
                console.log(`Collection ID: ${collectionId}`);
                
                const result = {
                  collectionId: collectionId.toString(),
                  creator: selectedAccount.address,
                  owner: selectedAccount.address,
                  blockHash: status.asInBlock.toHex()
                };

                console.log("Collection created successfully:", result);
                resolve(result);
              }
            });
          } else if (status.isFinalized) {
            console.log(`Finalized block hash: ${status.asFinalized}`);
            unsub();
          }
        }
      );
    } catch (error) {
      console.error("Error in createCollection:", error);
      reject(error);
    }
  });
};
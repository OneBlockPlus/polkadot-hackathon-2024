import { web3FromSource } from "@polkadot/extension-dapp";

const setMetadataCollection = async (api, selectedAccount, collectionNumber, metadata) => {
  if (!api) {
    console.error("No API available to proceed.");
    alert("Not connected to API");
    return;
  }

  if (!selectedAccount) {
    console.error("No account selected.");
    alert("Select an account.");
    return;
  }

  if (!collectionNumber) {
    console.error("Collection number is missing.");
    alert("Collection number is missing.");
    return;
  }

  if (!metadata) {
    console.error("Metadata is missing.");
    alert("Metadata is missing.");
    return;
  }

  try {
    // Get the injector for the selected account
    const injector = await web3FromSource(selectedAccount.meta.source);
    api.setSigner(injector.signer);

    // Create the transaction
    const tx = api.tx.nfts.setCollectionMetadata(collectionNumber, metadata);

    // Sign and send the transaction, returning a promise that resolves on finalization
    return new Promise((resolve, reject) => {
      const unsub = tx.signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ status, events, dispatchError }) => {
          console.log(`Transaction status: ${status.type}`);

          // Handle dispatch errors
          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(dispatchError.asModule);
              const { docs, name, section } = decoded;
              const errorMessage = `Error: ${section}.${name}: ${docs.join(" ")}`;
              console.error(errorMessage);
              alert(errorMessage);
              reject(errorMessage);
            } else {
              const errorMessage = `Error: ${dispatchError.toString()}`;
              console.error(errorMessage);
              alert(errorMessage);
              reject(errorMessage);
            }
            return;
          }

          // Log and display transaction success
          if (status.isInBlock) {
            console.log(`Included in block hash: ${status.asInBlock}`);
            console.log("Transaction events:");
            events.forEach(({ event: { data, method, section } }) => {
              console.log(`\t ${section}.${method}: ${data.toString()}`);
            });
          }

          if (status.isFinalized) {
            console.log(`Transaction finalized at block hash: ${status.asFinalized}`);
            alert(`Metadata has been successfully set for Collection No. ${collectionNumber}`);
            resolve({
              status: "finalized",
              blockHash: status.asFinalized,
              events,
            });// Unsubscribe from the transaction updates
          }
        }
      );
    });
  } catch (error) {
    console.error("Error setting metadata:", error);
    alert(`An error occurred: ${error.message}`);
    throw error; // Re-throw the error so the caller can handle it if necessary
  }
};

export default setMetadataCollection;

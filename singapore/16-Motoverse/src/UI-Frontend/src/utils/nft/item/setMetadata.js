import { web3FromSource } from "@polkadot/extension-dapp";

const setMetadataNFT = async (_api, selectedAccount, collectionId, nftId, metadata) => {
  const api = _api;

  if (!_api || !selectedAccount) {
    console.log("No account available to proceed");
    return;
  }

  if (!nftId || !metadata) {
    alert("You have not created an NFT yet");
    console.log("Cannot mint without creating NFT");
    return;
  }

  try {
    // Get the injector for the selected account
    const injector = await web3FromSource(selectedAccount.meta.source);

    // Set the signer for the API
    api.setSigner(injector.signer);

    const unsub = await api.tx.nfts
      .setMetadata(collectionId, nftId, metadata)
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ status, events, dispatchError }) => {
          console.log(`Transaction status: ${status.type}`);

          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(dispatchError.asModule);
              const { docs, name, section } = decoded;
              console.error(`Error: ${section}.${name}: ${docs.join(" ")}`);
              alert(`Error: ${section}.${name}: ${docs.join(" ")}`);
            } else {
              console.error(`Error: ${dispatchError.toString()}`);
              alert(`Error: ${dispatchError.toString()}`);
            }
          }

          if (status.isInBlock) {
            console.log(`Included at block hash: ${status.asInBlock}`);
            console.log("Events:");
            
            // Procesar eventos para mostrar información en lenguaje humano
            events.forEach(({ event: { method, section, data } }) => {
              const humanData = data.toHuman();
              console.log(`\t ${section}.${method}: ${humanData}`);

              // Mostrar una alerta con los datos relevantes
              alert(`Event: ${section}.${method}\nData: ${JSON.stringify(humanData, null, 2)}`);
            });
          } else if (status.isFinalized) {
            console.log(`Finalized block hash: ${status.asFinalized}`);
            unsub();
          }
        }
      );
  } catch (error) {
    console.error(error);
    alert(`Error: ${error.message}`);
  }

  console.log(api);
};

export default setMetadataNFT;

import { web3FromSource } from "@polkadot/extension-dapp";

const mintNFT = async (api, selectedAccount, nftNo) => {
  return new Promise(async (resolve, reject) => {
    if (!api || !selectedAccount) {
      console.log("No account or API available");
      reject("No account or API available");
      return;
    }

    if (!nftNo) {
      alert("No NFT number provided");
      console.log("Cannot mint without an NFT number");
      reject("No NFT number provided");
      return;
    }

    try {
      // Get the injector for the selected account
      const injector = await web3FromSource(selectedAccount.meta.source);

      // Set the signer for the API
      api.setSigner(injector.signer);

      // Create and sign the transaction
      const unsub = await api.tx.nfts
        .mint(nftNo, 0, selectedAccount.address, 0)
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
              } else {
                console.error(`Error: ${dispatchError.toString()}`);
              }
              reject("Dispatch error occurred");
              return;
            }

            if (status.isInBlock) {
              console.log(`Included at block hash: ${status.asInBlock}`);
              console.log("Events:");
              events.forEach(({ event: { data } }) => {
                console.log(`\t ${data}`);

                // Assuming the NFT ID is in the first event's data
                if (data[0] && data[0].toString()) {
                  const nftId = data[0].toString(); // Adjust this based on actual event structure
                  console.log(`Minted NFT ID: ${nftId}`);
                  // alert(`Minted the NFT with number ${nftNo} successfully.`);
                  resolve(nftId);
                }
              });
            } else if (status.isFinalized) {
              console.log(`Finalized block hash: ${status.asFinalized}`);
              unsub();
            }
          }
        );
    } catch (error) {
      console.error(error);
      reject("Error occurred during minting");
    }
  });
};

export default mintNFT;

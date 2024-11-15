import { Web3AccountsOptions } from "@polkadot/extension-inject/types";
import { PolkadotProvider } from "@unique-nft/accounts/polkadot";

  ///////////////////////////////////////////////////////
  /////// ----- GET SUBSTRATE SIGNER -----///////
  ///////////////////////////////////////////////////////
  export const getUniqueSigner = async () => {
    try {
      const options: Web3AccountsOptions = {
        accountType: ["sr25519"],
      };
      const provider = new PolkadotProvider(options);
      await provider.init();
      const signer = await provider.first();
      return signer

    } catch (e) {
      console.error(e);
    }
  };

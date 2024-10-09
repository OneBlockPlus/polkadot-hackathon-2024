import { Web3Wallet, IWeb3Wallet } from "@walletconnect/web3wallet";
import { Core } from "@walletconnect/core";
import { GetWalletConnectProjectId } from "@/../wailsjs/go/main/App";

export let web3wallet: IWeb3Wallet;

export const createWeb3Wallet = async () => {
  const projectId = await GetWalletConnectProjectId();
  const core = new Core({
    projectId,
    relayUrl: "wss://relay.walletconnect.com",
  });

  web3wallet = await Web3Wallet.init({
    core,
    metadata: {
      name: "Keyring",
      description: "Secure and handy hardware wallet for crypto holders",
      url: "https://keyring.so",
      icons: ["https://keyring.so/_next/image?url=%2Flogo.png&w=128&q=75"],
    },
  });
};

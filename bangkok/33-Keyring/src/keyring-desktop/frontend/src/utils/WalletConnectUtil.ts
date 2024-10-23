// import { Web3Wallet, IWeb3Wallet } from "@walletconnect/web3wallet";
// import { Core } from "@walletconnect/core";
import { GetWalletConnectProjectId } from "@/../wailsjs/go/main/App";

import { Core } from '@walletconnect/core'
import { WalletKit, IWalletKit } from '@reown/walletkit'

const core = new Core({
  projectId: '0a2083f8fd723dc761a50a53c0965a49'
})

const metadata = {
  name: 'Keyring',
  description: 'Secure and handy hardware wallet for crypto holders.',
  url: 'https://keyring.so',
  icons: ['https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/0ba975d7-08d7-4a71-d527-bc7d54bad600/sm']
}

export let web3wallet: IWalletKit;

export const createWeb3Wallet = async () => {
  const projectId = await GetWalletConnectProjectId();
  const core = new Core({
    projectId,
  });

  web3wallet = await WalletKit.init({
    core,
    metadata: {
      name: "Keyring",
      description: "Secure and handy hardware wallet for crypto holders",
      url: "https://keyring.so",
      icons: ['https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/0ba975d7-08d7-4a71-d527-bc7d54bad600/sm'],
    },
  });
  console.log("web3wallet inited", web3wallet);
};

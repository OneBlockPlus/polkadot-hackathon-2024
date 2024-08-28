import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
  web3FromSource,
} from "@polkadot/extension-dapp";
import { Web3AccountsOptions } from "@polkadot/extension-inject/types";

export const getSigner = async () => {
    
    const extensions = await web3Enable('Motoverse');

    if (extensions.length === 0) {
        // no extension installed, or the user did not accept the authorization
        // in this case we should inform the use and give a link to the extension
        return;
    }

    console.log(extensions)
  const allAccounts = await web3Accounts();
  console.log(allAccounts);
  let account = allAccounts[1];
  const injector = await web3FromSource(account.meta.source);
  let signer = injector?.signer;
  console.log(signer);
  return signer;
};

import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
  web3FromSource,
} from "@polkadot/extension-dapp";
import {
  InjectedAccountWithMeta,
  InjectedExtension,
  InjectedExtensionInfo,
  InjectedProvider,
  Injected,
} from "@polkadot/extension-inject/types";

export const getSigner = async (): Promise<InjectedExtension | undefined> => {
  try {
    await web3Enable("Softlaw");
    const accounts = await web3Accounts();
    const account = accounts[0];

    if (!account?.meta?.source) {
      alert("Invalid account data");
    }

    console.log("Selected account:", account);

    const address = account?.address;
    console.log("address", address);
    const injector = await web3FromAddress(address);
    console.log("injector", injector);
    let signer = await injector?.signer;
    return injector;

  } catch (error) {
    console.error("getSigner error:", error);
    alert(error instanceof Error ? error.message : "Failed to get signer");

  }
};


import { web3Accounts, web3FromSource } from "@polkadot/extension-dapp";
import { getApi } from "./getApi";

export const SignSend = async () => {
  let api = await getApi();

  const allAccounts = await web3Accounts();
  console.log(allAccounts);

  // `account` is of type InjectedAccountWithMeta
  // We arbitrarily select the first account returned from the above snippet
  const account = allAccounts[0];

  // here we use the api to create a balance transfer to some account of a value of 12344
  const transferExtrinsic = api.tx.balances.transfer(
    "5C5555yEXUcmEJ5kkcCMvdZjUo7NGJiQJMS7vZXEeoMhj3VQ",
    123456
  );

  // to be able to retrieve the signer interface from this account
  // we can use web3FromSource which will return an InjectedExtension type
  const injector = await web3FromSource(account.meta.source);

  let signer = injector?.signer;

//   transferExtrinsic
//     .signAndSend(account.address, { signer: injector.signer }, ({ status }) => {
//       if (status.isInBlock) {
//         console.log(`Completed at block hash #${status.asInBlock.toString()}`);
//       } else {
//         console.log(`Current status: ${status.type}`);
//       }
//     })
//     .catch((error: any) => {
//       console.log(":( transaction failed", error);
//     });
};

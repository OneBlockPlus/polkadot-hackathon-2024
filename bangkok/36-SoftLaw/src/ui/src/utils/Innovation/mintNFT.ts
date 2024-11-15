// import { ApiPromise } from '@polkadot/api';
// import { web3FromSource } from "@polkadot/extension-dapp";
// import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
// import type { Signer } from '@polkadot/api/types';
// import { getApi } from '../getApi';

// interface NFTMintResult {
//   nftId: string;
//   blockHash: string;
// }

// const mintNFT = async (
// //   api: ApiPromise,
//   selectedAccount: InjectedAccountWithMeta,
//   nftNo: number
// ): Promise<NFTMintResult> => {
//   return new Promise(async (resolve, reject) => {

//     let api = await getApi()
//     if (!api || !selectedAccount) {
//       console.log("No account or API available");
//       reject(new Error("No account or API available"));
//       return;
//     }

//     if (!nftNo) {
//       const error = "No NFT number provided";
//       alert(error);
//       console.log("Cannot mint without an NFT number");
//       reject(new Error(error));
//       return;
//     }

//     try {
//       // Get the injector for the selected account
//       const injector = await web3FromSource(selectedAccount.meta.source);
      
//       // Properly handle the signer type
//       const signer: Signer | undefined = injector.signer;
//       api.setSigner(signer);

//       // Create and sign the transaction
//       const unsub = await api.tx.nfts
//         .mint(nftNo, 0, selectedAccount.address, 0)
//         .signAndSend(
//           selectedAccount.address,
//           { signer },
//           ({ status, events, dispatchError }) => {
//             console.log(`Transaction status: ${status.type}`);

//             if (dispatchError) {
//               if (dispatchError.isModule) {
//                 const decoded = api.registry.findMetaError(dispatchError.asModule);
//                 const { docs, name, section } = decoded;
//                 const errorMessage = `${section}.${name}: ${docs.join(" ")}`;
//                 console.error(`Error: ${errorMessage}`);
//                 reject(new Error(errorMessage));
//               } else {
//                 const errorMessage = dispatchError.toString();
//                 console.error(`Error: ${errorMessage}`);
//                 reject(new Error(errorMessage));
//               }
//               return;
//             }

//             if (status.isInBlock) {
//               const blockHash = status.asInBlock.toString();
//               console.log(`Included at block hash: ${blockHash}`);
//               console.log("Events:");

//               events.forEach(({ event: { data } }) => {
//                 console.log(`\t ${data.toString()}`);

//                 // Assuming the NFT ID is in the first event's data
//                 if (data[0] && data[0].toString()) {
//                   const nftId = data[0].toString();
//                   console.log(`Minted NFT ID: ${nftId}`);
//                   resolve({
//                     nftId,
//                     blockHash
//                   });
//                 }
//               });
//             } else if (status.isFinalized) {
//               console.log(`Finalized block hash: ${status.asFinalized.toString()}`);
//               unsub();
//             }
//           }
//         );
//     } catch (error) {
//       console.error(error);
//       reject(new Error("Error occurred during minting"));
//     }
//   });
// };

// export default mintNFT;
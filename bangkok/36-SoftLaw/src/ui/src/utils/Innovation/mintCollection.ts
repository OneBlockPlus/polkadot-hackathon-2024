// import { web3FromSource } from "@polkadot/extension-dapp";

// const createCollection = async (api:any, selectedAccount:any) => {
//   return new Promise(async (resolve, reject) => {
//     try {

//     const _api = api;
//     const _selectedAccount = selectedAccount;

//     const balance = api.balance;
//     console.log(balance)

//     const injector = await web3FromSource(_selectedAccount.meta.source);
//       console.log(selectedAccount);

//     _api.setSigner(injector.signer);

//     console.log("nft config: ", (await api.tx.nfts));

//     const unsub = await api.tx.nfts
//       .create(_selectedAccount.address, 0)
//       .signAndSend(
//         _selectedAccount.address,
//         { signer: injector.signer },
//         ({ status:any, events:any, dispatchError:any }) => {
//           console.log(`Transaction status: ${status.type}`);

//           if (dispatchError) {
//             if (dispatchError.isModule) {
//               const decoded = _api.registry.findMetaError(
//                 dispatchError.asModule
//               );
//               const { docs, name, section } = decoded;
//               console.error(`Error: ${section}.${name}: ${docs.join(" ")}`);
//             } else {
//               console.error(`Error: ${dispatchError.toString()}`);
//             }
//           }

//           if (status.isInBlock) {
//             console.log(`Included at block hash: ${status.asInBlock}`);
//             console.log("Events:");
//             events.forEach(({ event: { data } }, index) => {
//               console.log(`\t ${data}`);

//               if (index === 2) {
//                 const firstValue = data[0];
//                 console.log(`First value of the third array: ${firstValue}`);
//                 alert(
//                   `Created the Collection with number ${firstValue} successfully.`
//                 );
//                 resolve(firstValue);
//               }
//             });
//           } else if (status.isFinalized) {
//             console.log(`Finalized block hash: ${status.asFinalized}`);
//             unsub();
//           }
//         }
//       );
      
//   } catch (e) {
//     console.error("Error: ", e);
//     reject(e);
//   }
// });

// };

// export default createCollection;

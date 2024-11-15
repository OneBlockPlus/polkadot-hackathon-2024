"use client";
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAccountsContext } from "@/context/account";
import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { getSoftlawApi } from "@/utils/softlaw/getApi";

interface AcceptPurchaseResult {
 contractId: string;
 blockHash: string;
 offerId: string;
}

export default function AcceptPurchaseButton({ offerId }: { offerId: string }) {
   const { selectedAccount } = useAccountsContext();
   const { toast } = useToast();
   const [loading, setLoading] = useState(false);

   const acceptPurchase = async (): Promise<AcceptPurchaseResult> => {
       const api = await getSoftlawApi(); 
       await web3Enable("softlaw");
       
       if (!selectedAccount?.address) {
           throw new Error("No selected account");
       }

       const injector = await web3FromAddress(selectedAccount.address);
       if (!injector?.signer) {
           throw new Error("No signer found");
       }

       api.setSigner(injector.signer as any);

       return new Promise((resolve, reject) => {
           api.tx.ipPallet.acceptPurchase(offerId)
               .signAndSend(
                   selectedAccount.address,
                   { signer: injector.signer as any },
                   ({ status, events, dispatchError }) => {
                       if (dispatchError) {
                           if (dispatchError.isModule) {
                               const decoded = api.registry.findMetaError(dispatchError.asModule);
                               const { docs, name, section } = decoded;

                               switch (`${section}.${name}`) {
                                   case "ipPallet.OfferNotFound":
                                       reject(new Error("Purchase offer not found"));
                                       break;
                                   case "ipPallet.NotAPurchaseOffer":
                                       reject(new Error("This is not a purchase offer"));
                                       break;
                                   default:
                                       reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
                               }
                           } else {
                               reject(new Error(dispatchError.toString()));
                           }
                           return;
                       }

                       if (status.isInBlock || status.isFinalized) {
                           const blockHash = status.isInBlock ? status.asInBlock : status.asFinalized;

                           // Buscar el evento ContractCreated
                           events.forEach(({ event }) => {
                               if (event.section === 'ipPallet' && 
                                   event.method === 'ContractCreated') {
                                   const contractId = event.data[0].toString();
                                   resolve({
                                       contractId,
                                       offerId,
                                       blockHash: blockHash.toString()
                                   });
                               }
                           });
                       }
                   }
               );
       });
   };

   const handleAcceptPurchase = async () => {
       try {
           setLoading(true);
           const result = await acceptPurchase();
           
           toast({
               title: "Success",
               description: `Purchase contract created! Contract ID: ${result.contractId}`,
               variant: "default",
           });
       } catch (error: any) {
           toast({
               title: "Error",
               description: error.message || "Failed to accept purchase offer",
               variant: "destructive",
           });
       } finally {
           setLoading(false);
       }
   };

   return (
       <button
           onClick={handleAcceptPurchase}
           disabled={loading}
           className={`
               px-4 py-2 rounded-lg
               ${loading ? 
                   'bg-gray-500 cursor-not-allowed' : 
                   'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
               }
               text-white font-medium
               transition-colors duration-200
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
           `}
       >
           {loading ? (
               <div className="flex items-center">
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Processing...
               </div>
           ) : (
               "Accept Purchase Offer"
           )}
       </button>
   );
}
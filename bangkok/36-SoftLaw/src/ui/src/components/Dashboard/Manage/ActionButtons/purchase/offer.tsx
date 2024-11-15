"use client";
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAccountsContext } from "@/context/account";
import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { getSoftlawApi } from "@/utils/softlaw/getApi";

// Enum para tipos de pago
enum PaymentType {
  OneTime = 'OneTime',
  Periodic = 'Periodic'
}

interface PaymentTerms {
  type: PaymentType;
  amount: number;
  // Solo para pagos periódicos
  period?: number;
  totalPayments?: number;
}

interface OfferResult {
  offerId: string;
  blockHash: string;
  nftId: string;
}

export default function OfferPurchaseButton({ 
  nftId,
  paymentTerms 
}: { 
  nftId: string;
  paymentTerms: PaymentTerms;
}) {
    const { selectedAccount } = useAccountsContext();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const createPurchaseOffer = async (): Promise<OfferResult> => {
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

        // Crear el objeto PaymentType según el enum
        const paymentTypeParam = paymentTerms.type === PaymentType.OneTime 
            ? { OneTime: { amount: paymentTerms.amount } }
            : { 
                Periodic: { 
                    amount: paymentTerms.amount,
                    period: paymentTerms.period,
                    total_payments: paymentTerms.totalPayments
                } 
            };

        return new Promise((resolve, reject) => {
            api.tx.ipPallet.offerPurchase(
                nftId,
                paymentTypeParam
            )
            .signAndSend(
                selectedAccount.address,
                { signer: injector.signer as any },
                ({ status, events, dispatchError }) => {
                    if (dispatchError) {
                        if (dispatchError.isModule) {
                            const decoded = api.registry.findMetaError(dispatchError.asModule);
                            const { docs, name, section } = decoded;

                            switch (`${section}.${name}`) {
                                case "ipPallet.NftNotFound":
                                    reject(new Error("NFT not found"));
                                    break;
                                case "ipPallet.NotNftOwner":
                                    reject(new Error("You don't own this NFT"));
                                    break;
                                case "ipPallet.NftInEscrow":
                                    reject(new Error("NFT is currently in escrow"));
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
                        const blockHash = status.isInBlock 
                            ? status.asInBlock 
                            : status.asFinalized;

                        // Buscar el evento PurchaseOffered
                        events.forEach(({ event }) => {
                            if (event.section === 'ipPallet' && 
                                event.method === 'PurchaseOffered') {
                                const offerId = event.data[0].toString();
                                resolve({
                                    offerId,
                                    nftId,
                                    blockHash: blockHash.toString()
                                });
                            }
                        });
                    }
                }
            );
        });
    };

    const handleCreateOffer = async () => {
        try {
            setLoading(true);
            const result = await createPurchaseOffer();
            
            toast({
                title: "Success",
                description: `Purchase offer created with ID: ${result.offerId}`,
                variant: "default",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create purchase offer",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCreateOffer}
            disabled={loading}
            className={`px-4 py-2 rounded-lg ${
                loading 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
        >
            {loading ? "Creating offer..." : "Create Purchase Offer"}
        </button>
    );
}
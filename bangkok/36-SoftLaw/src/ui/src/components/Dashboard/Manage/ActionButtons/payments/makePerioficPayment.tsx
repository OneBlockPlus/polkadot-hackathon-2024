"use client";
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAccountsContext } from "@/context/account";
import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { getSoftlawApi } from "@/utils/softlaw/getApi";

interface PaymentResult {
  success: boolean;
  isComplete: boolean;
  blockHash: string;
}

export default function MakePeriodicPayment({ contractId }: { contractId: string }) {
    const { selectedAccount } = useAccountsContext();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const makePayment = async (): Promise<PaymentResult> => {
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
            // Crear la transacción
            api.tx.ipPallet.makePeriodicPayment(contractId)
                .signAndSend(
                    selectedAccount.address,
                    { signer: injector.signer as any },
                    ({ status, events, dispatchError }) => {
                        if (dispatchError) {
                            if (dispatchError.isModule) {
                                const decoded = api.registry.findMetaError(dispatchError.asModule);
                                const { docs, name, section } = decoded;

                                switch (`${section}.${name}`) {
                                    case "ipPallet.ContractNotFound":
                                        reject(new Error("Contract not found"));
                                        break;
                                    case "ipPallet.NotPeriodicPayment":
                                        reject(new Error("Not a periodic payment contract"));
                                        break;
                                    case "ipPallet.PaymentNotDue":
                                        reject(new Error("Payment is not due yet"));
                                        break;
                                    case "ipPallet.InsufficientBalance":
                                        reject(new Error("Insufficient funds for payment"));
                                        break;
                                    case "ipPallet.ZeroPayment":
                                        reject(new Error("Payment amount is zero"));
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
                            
                            let isComplete = false;
                            let success = false;

                            events.forEach(({ event }) => {
                                if (event.section === 'ipPallet') {
                                    switch(event.method) {
                                        case 'PeriodicPaymentMade':
                                            success = true;
                                            break;
                                        case 'PaymentsCompleted':
                                            isComplete = true;
                                            success = true;
                                            break;
                                        case 'PaymentMade':
                                            success = true;
                                            break;
                                    }
                                }
                            });

                            if (success) {
                                resolve({
                                    success,
                                    isComplete,
                                    blockHash: blockHash.toString()
                                });
                            }
                        }
                    }
                );
        });
    };

    const handlePayment = async () => {
        try {
            setLoading(true);
            const result = await makePayment();
            
            toast({
                title: "Success",
                description: result.isComplete 
                    ? "All payments completed successfully!" 
                    : "Payment processed successfully",
                variant: "default",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to process payment",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading}
            className={`px-4 py-2 rounded-lg ${
                loading 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
        >
            {loading ? "Processing..." : "Make Payment"}
        </button>
    );
}
"use client";
import { useToast } from "@/hooks/use-toast";
import { useAccountsContext } from "@/context/account";
import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { getSoftlawApi } from "@/utils/softlaw/getApi";
import { useState } from "react";

// Tipos para las opciones de pago
enum PaymentType {
  OneTime = 'OneTime',
  Periodic = 'Periodic'
}

interface OfferLicenseParams {
  nftId: number;
  paymentType: PaymentType;
  isExclusive: boolean;
  duration: number;
}

interface OfferResult {
  offerId: string;
  blockHash: string;
}

export default function OfferLicenseButton() {
    const { selectedAccount } = useAccountsContext();
    const { toast } = useToast();
    const [loading, setLoading] = useState<boolean>(false);

    const offerLicense = async ({
        nftId,
        paymentType,
        isExclusive,
        duration
    }: OfferLicenseParams): Promise<OfferResult> => {
        try {
            let api = await getSoftlawApi(); 
            await web3Enable("softlaw");
            
            if (!selectedAccount?.address) {
                throw new Error("No selected account");
            }

            // Get injector
            const injector = await web3FromAddress(selectedAccount.address);
            console.log("Got injector:", injector.name);

            if (!injector?.signer) {
                throw new Error("No signer found");
            }

            // Set signer
            api.setSigner(injector.signer as any);

            // Crear el PaymentType según el enum
            const paymentTypeParam = paymentType === PaymentType.OneTime 
                ? { OneTime: { amount: 1000 } }  // Ajusta según tu estructura
                : { Periodic: { amount: 100, period: 1000 } }; // Ajusta según tu estructura

            // Llamar a la función del pallet
            // const tx = api.tx.ipPallet.offerLicense(
            //     nftId,              // NFT ID
            //     paymentTypeParam,   // Payment Type
            //     isExclusive,        // is_exclusive
            //     duration           // duration in blocks
            // );

            const tx = api.tx.ipPallet.createLicense(
                nftId,              // NFT ID
                paymentTypeParam,   // Payment Type
                isExclusive,        // is_exclusive
                duration           // duration in blocks
            );

            console.log("Transaction created:", tx.method.toHex());

            return new Promise((resolve, reject) => {
                tx.signAndSend(
                    selectedAccount.address,
                    { signer: injector.signer as any },
                    ({ status, events, dispatchError }) => {
                        if (dispatchError) {
                            if (dispatchError.isModule) {
                                try {
                                    const decoded = api.registry.findMetaError(dispatchError.asModule);
                                    const { docs, name, section } = decoded;
                                    
                                    // Manejar errores específicos
                                    switch (`${section}.${name}`) {
                                        case "ipPallet.NftNotFound":
                                            reject(new Error("NFT not found"));
                                            break;
                                        case "ipPallet.NotNftOwner":
                                            reject(new Error("You don't own this NFT"));
                                            break;
                                        case "ipPallet.NftInEscrow":
                                            reject(new Error("NFT is in escrow"));
                                            break;
                                        case "ipPallet.ExclusiveLicenseExists":
                                            reject(new Error("An exclusive license already exists for this NFT"));
                                            break;
                                        default:
                                            reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
                                    }
                                } catch (err) {
                                    reject(dispatchError);
                                }
                            } else {
                                reject(new Error(dispatchError.toString()));
                            }
                            return;
                        }

                        if (status.isInBlock) {
                            console.log(`Included at block hash: ${status.asInBlock}`);

                            // Buscar el evento LicenseOffered
                            events.forEach(({ event }) => {
                                if (event.section === 'ipPallet' && event.method === 'LicenseOffered') {
                                    const offerId = event.data[0].toString();
                                    resolve({
                                        offerId,
                                        blockHash: status.asInBlock.toString()
                                    });
                                }
                            });
                        }
                    }
                );
            });

        } catch (error) {
            console.error("Error in offerLicense:", error);
            throw error;
        }
    };

    const handleOfferLicense = async () => {
        try {
            setLoading(true);
            const result = await offerLicense({
                nftId: 1, // El ID del NFT que quieres licenciar
                paymentType: PaymentType.OneTime,
                isExclusive: false,
                duration: 100000 // Número de bloques
            });
            
            toast({
                title: "Success",
                description: `License offered with ID: ${result.offerId}`,
                variant: "default",
            });
        } catch (error: any) {
            console.error("Offer error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to offer license",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className="mt-4 text-white hover:bg-white hover:text-blue-500 border border-yellow-400 rounded px-4 py-2"
            onClick={handleOfferLicense}
            disabled={loading}
        >
            {loading ? "Creating offer..." : "Offer License"}
        </button>
    );
}
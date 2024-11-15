"use client";
import { useToast } from "@/hooks/use-toast";
import { useInnovationContext } from "@/context/innovation";
import { useAccountsContext } from "@/context/account";
import { web3Enable, web3FromAddress } from "@polkadot/extension-dapp";
import { getSoftlawApi } from "@/utils/softlaw/getApi";

interface MintResult {
  collectionId: string;
  creator: string;
  owner: string;
  blockHash: string;
}

export default function MintNftButton() {
  const { nftMetadata, setLoading, loading } = useInnovationContext();

  const { selectedAccount } = useAccountsContext();
  const { toast } = useToast();

  // const validateMetadata = () => {
  //   if (!nftMetadata) {
  //     throw new Error("NFT metadata is not defined");
  //   }

  //   if (
  //     !nftMetadata.name ||
  //     !nftMetadata.description ||
  //     !nftMetadata.useDate ||
  //     !nftMetadata.registryNumber
  //   ) {
  //     throw new Error("Missing required fields in metadata");
  //   }

  //   const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  //   if (!dateRegex.test(nftMetadata.useDate)) {
  //     throw new Error("Use date must be in YYYY-MM-DD format");
  //   }

  //   // Validar longitudes máximas
  //   if (nftMetadata.name.length > 50) {
  //     throw new Error("Name is too long (max 50 characters)");
  //   }
  //   if (nftMetadata.description.length > 200) {
  //     throw new Error("Description is too long (max 200 characters)");
  //   }
  // };

  const mintNFT = async () => {
    // validateMetadata();

    let api = await getSoftlawApi();
    await web3Enable("softlaw");

    if (!selectedAccount?.address) {
      throw new Error("No selected account");
    }

    // let type = await api.createType()
   
    const addr = selectedAccount.address;
 
    const injector = await web3FromAddress(addr);

    api.setSigner(injector.signer as any);

    const tx = await api.tx.ipPallet
      .mintNft(
        "nftMetadata.name",
        "nftMetadata.description",
        "nftMetadata.useDate",
        "nftMetadata.registryNumber"
      )
      .signAndSend(addr);

    console.log(tx);

    // return new Promise(async (resolve, reject) => {
    // return new Promise(async (resolve, reject) => {
    //   try {
    //       console.log("Starting NFT minting with metadata:", nftMetadata);

    //       const injector = await web3FromAddress(addr);
    //       if (!injector?.signer) {
    //           throw new Error("No signer found");
    //       }

    //       api.setSigner(injector.signer as any);

    //       // Pasar los strings directamente
    //       const tx = api.tx.ipPallet.mintNft(
    //           nftMetadata.name,
    //           nftMetadata.description,
    //           nftMetadata.useDate,
    //           nftMetadata.registryNumber
    //       );

    // // Log la transacción para debugging
    // console.log("Transaction details:", {
    //     method: tx.method.toHuman(),
    //     hexData: tx.method.toHex(),
    //     args: tx.args.map(arg => arg.toString())
    // });

    //         const unsub = await tx.signAndSend(
    //             addr,
    //             { signer: injector.signer as any },
    //             ({ status, events, dispatchError }) => {
    //                 if (dispatchError) {
    //                     if (dispatchError.isModule) {
    //                         try {
    //                             const decoded = api.registry.findMetaError(dispatchError.asModule);
    //                             const { docs, name, section } = decoded;
    //                             reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
    //                         } catch (err) {
    //                             reject(new Error("Failed to decode error"));
    //                         }
    //                     } else {
    //                         reject(new Error(dispatchError.toString()));
    //                     }
    //                     unsub();
    //                     return;
    //                 }

    //                 if (status.isInBlock || status.isFinalized) {
    //                     events.forEach(({ event }) => {
    //                         if (event.section === 'ipPallet' && event.method === 'NftMinted') {
    //                             resolve({
    //                                 collectionId: event.data[0].toString(),
    //                                 creator: addr,
    //                                 owner: addr,
    //                                 blockHash: status.isInBlock ?
    //                                     status.asInBlock.toString() :
    //                                     status.asFinalized.toString()
    //                             });
    //                         }
    //                     });

    //                     if (status.isFinalized) {
    //                         unsub();
    //                     }
    //                 }
    //             }
    // );
    //     } catch (error) {
    //         console.error("Error in minting NFT:", error);
    //         reject(error instanceof Error ? error : new Error('Unknown error occurred'));
    //     }
    // });
  };

  const handleMint = async () => {
    try {
      setLoading(true);
      // const result = await getSoftlawApi();
      const result = await mintNFT();
      toast({
        title: "Success",
        description: `NFT minted with ID: ${result}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Mint error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to mint NFT",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
        className="bg-[#D0DFE4] min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl w-[128px] min-[2000px]:w-[200px] items-center text-center rounded-[16px] text-[#1C1A11] px-[22px] py-[8px] flex-shrink-0 hover:bg-[#FACC15]"
      onClick={handleMint}
      disabled={loading}
    >
      {loading ? "Minting..." : "Mint NFT"}
    </button>
  );
}

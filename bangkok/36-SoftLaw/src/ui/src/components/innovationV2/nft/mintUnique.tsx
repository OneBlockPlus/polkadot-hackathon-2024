"use client";
import { getUniqueSDK } from "@/utils/unique/getSDK";
import { getUniqueSigner } from "@/utils/unique/getSigner";
import { ethers } from "ethers";
import { Address } from "@unique-nft/utils";
import abi from "../../../utils/abi_minter.json";
import { useToast } from "@/hooks/use-toast";
import { useInnovationContext } from "@/context/innovation";
import Nft from "@/components/ProofOfInnovation/registry/Nft";

interface AbiInput {
  name: string;
}
interface AbiOutput {
  internalType: string;
  name: string;
  type: string;
  components?: AbiOutput[];
}
interface AbiItem {
  name: string;
  inputs?: AbiInput[];
  outputs?: AbiOutput[];
}
declare type Abi = AbiItem[];

export default function MintNftUnique() {
    const {
        selectedTabInnovation,
        setSelectedTabInnovation,
        nftMetadata, setMetadataHash, setLoading,nft,uniqueCollectionAddress,
        setNftMetadata,metadataHash, ipfsHashes, imageHash, imagesLinks 
      } = useInnovationContext();

  const { toast } = useToast();

  const abiTyped = abi as Abi;

  const createNFTSC = async () => {
    try {
      setLoading(true);
      let signer = await getUniqueSigner();
      let subAddr = signer?.address ?? "";
      let sdk = await getUniqueSDK(signer);
      const ethMirror = Address.mirror.substrateToEthereum(subAddr);
      //   let subAddr = signer?.address;
      console.log("susb", signer);

      const receipt = await sdk.evm.send({
        funcName: "mintToken",
        args: [
          nft?.name,
          nft?.description,
          nft?.metadata,
          uniqueCollectionAddress,
          imageHash,
          [{ trait_type: "Power", value: "42" }],
          // NOTICE: CrossAddress - set a substrate address as a token owner
          {
            eth: ethers.ZeroAddress,
            sub: Address.extract.substratePublicKey(subAddr),
          },
        ],

        gasLimit: 1_000_000,
        abi: abiTyped,
        contractAddress: "0x5670b8b38335fb8fda741092c2b27db32b0e0b37",
      });

      console.log(receipt);

      console.log("Transaction confirmed in block", receipt.block);

      // Event handler
      receipt.events.forEach((event) => {
        console.log(
          `Event: ${event.section} - Data:`
          // event.method,
          // event.meta,
          // event.data
        );
      });

      if (
        receipt?.parsed?.parsedEvents &&
        receipt.parsed.parsedEvents.length > 0
      ) {
        const collectionId = receipt.parsed.parsedEvents[0];

        toast({
          title: "Collection Created",
          description: `Successfully created collection ${collectionId} from Substrate Address: ${subAddr}, Evm mirror: ${ethMirror}`,
          variant: "default",
          className: "bg-white text-black border border-gray-200",
        });
      } else {
        console.error("No parsed events found in the transaction receipt.");
        toast({
          title: "Error Collection",
          description: "No parsed events found in the transaction receipt.",
          variant: "destructive",
        });
      }
      console.log(receipt);
      //   setLoading(false);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setSelectedTabInnovation("2");
    }
  };
  return (
    <button
      className={
        "mt-4 text-white hover:bg-white hover:text-blue-500 border border-yellow-400 rounded px-4 py-2 "
      }
      onClick={createNFTSC}
    >
      Mint NFT
    </button>
  );
}

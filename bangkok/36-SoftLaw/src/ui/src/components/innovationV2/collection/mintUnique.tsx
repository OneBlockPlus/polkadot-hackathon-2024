import MaxWidthWrapper from "@/components/MaxWidhWrapper";
import { useToast } from "@/hooks/use-toast";
import { getUniqueSigner } from "@/utils/unique/getSigner";
import CollectionTypes from "@/utils/collectionTypes.json";
import abi from "../../../utils/abi_minter.json";
import { ethers } from "ethers";
import { Address } from "@unique-nft/utils";
import { getUniqueSDK } from "@/utils/unique/getSDK";
import { useInnovationContext } from "@/context/innovation";

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

interface CollectionCreatedEvent {
  name: string;
  values: {
    collectionAddress: string; 
  };
}

export default function MintUniqueCollection() {
  const {
    uniqueCollectionAddress,
    setUniqueCollectionAddress,
    setLoading,
    collection,
    setCollection,
    loading, setSelectedTabInnovation
  } = useInnovationContext();

  const abiTyped = abi as Abi;
  const { toast } = useToast();

  const handleCollectionSelect = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCollection = CollectionTypes.find(
      (type) => type.name === event.target.value
    );

    if (selectedCollection) {
      setCollection({
        name: selectedCollection.name,
        description: selectedCollection.description,
        prefix: selectedCollection.prefix,
        image: selectedCollection.image,
      });
    }
  };

  const handleMintCollection = async () => {
    if (!collection) {
      toast({
        title: "Error Collection",
        description: "Select a Collection",
        variant: "destructive",
      });
      return
    }
    try {
      setLoading(true);
      let signer = await getUniqueSigner();
      let subAddr = signer?.address ?? "";
      const ethMirror = Address.mirror.substrateToEthereum(subAddr);
      const sdk = await getUniqueSDK(signer);

      const tx = await sdk.evm.send({
        funcName: "mintCollection",
        args: [
          collection?.name,
          collection?.description,
          collection?.prefix,
          collection?.image,
          { token_owner: true, collection_admin: true, restricted: [] },
          {
            eth: ethers.ZeroAddress,
            sub: Address.extract.substratePublicKey(subAddr),
          },
        ],
        abi: abiTyped,
        contractAddress: "0x5670b8b38335fb8fda741092c2b27db32b0e0b37",
      });

      const receipt = tx;

      if (
        receipt?.parsed?.parsedEvents &&
        receipt.parsed.parsedEvents.length > 0
      ) {
        const event = receipt.parsed.parsedEvents.find(
          (e) => e.name === "CollectionCreated"
        ) as CollectionCreatedEvent; 

        if (event && event.values && event.values.collectionAddress) {
          const collectionAddr = event.values.collectionAddress;
          setUniqueCollectionAddress(collectionAddr); 

          toast({
            title: "Collection Created",
            description: `Successfully created collection at address: ${collectionAddr}`,
            variant: "default",
            className: "bg-white text-black border border-gray-200",
          });
        } else {
          console.error("CollectionCreated event not found.");
          toast({
            title: "Error Collection",
            description: "CollectionCreated event not found.",
            variant: "destructive",
          });
        }
      } else {
        console.error("No parsed events found in the transaction receipt.");
        toast({
          title: "Error Collection",
          description: "No parsed events found in the transaction receipt.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("Error during transaction:", error);
      toast({
        title: "Error Collection",
        description: `Error during collection creation transaction ${error}`,
        variant: "destructive",
      });
    } finally {
        setLoading(false); 
        setSelectedTabInnovation("2")
      }
  };

  return (
    <button
      className={
        "bg-[#D0DFE4] text-[#1C1A11] px-6 py-2 rounded-lg hover:bg-[#FACC15] transition-colors disabled:opacity-50"
      }
      onClick={handleMintCollection}
      disabled={loading}
    >
      Mint Collection with Unique Network
    </button>
  );
}

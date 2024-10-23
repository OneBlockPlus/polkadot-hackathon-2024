import MaxWidthWrapper from "@/components/MaxWidhWrapper";
import { useToast } from "@/hooks/use-toast";
// import { getSubstrateSigner } from "@/utils/getSigner";
import { useState } from "react";
import CollectionTypes from "@/utils/collectionTypes.json";
import abi from "../../../utils/abi_minter.json";
import { useUnique } from "@/context/unique";

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
// Define the expected structure of the event
interface CollectionCreatedEvent {
  name: string;
  values: {
    collectionAddress: string; // Specify the type of collectionAddress
  };
}

export default function Collection() {
  const [loading, setLoading] = useState<boolean | null>(null);
  const { collectionAddress, setCollectionAddress } = useUnique();
  const [collection, setCollection] = useState({
    name: "",
    description: "",
    prefix: "",
    image: "",
  });
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

  return (
    <MaxWidthWrapper>
      <div>
        <label htmlFor="collectionSelect">Choose a Collection Type:</label>
        <select
          id="collectionSelect"
          onChange={handleCollectionSelect}
          value={collection.name}
        >
          <option value="">Select a collection</option>
          {CollectionTypes.map((type, index) => (
            <option key={index} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>

        {/* Mostrar detalles de la colección seleccionada */}
        {collection.name && (
          <div className="mt-4">
            <h3>Selected Collection</h3>
            <p>
              <strong>Name:</strong> {collection.name}
            </p>
            <p>
              <strong>Description:</strong> {collection.description}
            </p>
            <p>
              <strong>Prefix:</strong> {collection.prefix}
            </p>
            {collection.image && (
              <img
                src={collection.image}
                alt={`${collection.name} logo`}
                style={{ width: "100px" }}
              />
            )}
          </div>
        )}
        {collectionAddress && (
          <p><strong>Collection Address:</strong> {collectionAddress}</p>
        )}
      </div>
      <button
        className={'mt-4 text-white hover:bg-white hover:text-blue-500 border border-yellow-400 rounded px-4 py-2 ' }
        // onClick={handleMintCollection}
      >
       Mint Collection
      </button>
      <button
        className={'mt-4 text-white hover:bg-white hover:text-blue-500 border border-yellow-400 rounded px-4 py-2 ' }
        onClick={()=>{console.log(collectionAddress)}}
      >
       Collection Address
      </button>
    </MaxWidthWrapper>
  );
}

import { usePolkaContext } from "../../context/PolkaContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../Components/Common/Buttons/Button";
import Input from "../../Components/Common/Input";
import QueryCollectionMetadata from "../../utils/nft/collection/query2";
import QueryCollectionOwner from "../../utils/nft/collection/query";
import CollectionCard from "../Dashboard/collectionCard";

const Garage = () => {
  const { api } = usePolkaContext();
  const [collectionId, setCollectionId] = useState(13);
  const [metadata, setMetadata] = useState(null);

  const handleQueryCollection = async () => {
    if (!collectionId) {
      alert("Add a collection Id");
      return;
    }

    try {
      const queryOwner = await QueryCollectionOwner(collectionId, api);
      const queryMetadata = await QueryCollectionMetadata(collectionId, api);

      const response = await fetch(queryMetadata.data);
      const data = await response.json();

      const tempMetadata = {
        name: data.name,
        description: data.description,
        image: data.image,
        owner: queryOwner.owner,
        id: collectionId,
      };

      setMetadata(tempMetadata);
    } catch (e) {
      console.error(e);
      alert("Metadata of the Collection Not Found, try with another ID");
    }
  };

  return (
    <div className="self-stretch w-full flex flex-col p-4 items-center gap-4 rounded-2xl bg-white">
      <div className="self-stretch w-full flex flex-col items-start gap-5">
        <div className="self-stretch flex justify-between items-start w-full">
          <h3 className="text-xl font-semibold text-[#003855]">My Garage</h3>
          <div className="flex items-center gap-4">
            <Link
              to="/CreateCollection"
              className="w-40 rounded-full bg-[#BEC6FF] flex items-center justify-center px-4 py-2"
            >
              <p className="font-medium text-base text-white">Add Collection</p>
            </Link>
            <Link
              to="/AddMyCar"
              className="w-40 rounded-full bg-[#BEC6FF] flex items-center justify-center px-4 py-2"
            >
              <p className="font-medium text-base text-white">Add my Car</p>
            </Link>

            <button className="p-2">
              <img src="/images/Menu.svg" alt="Menu" />
            </button>

            <button className="p-2">
              <img src="/images/hamburger.svg" alt="Hamburger" />
            </button>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex flex-col">
            <Input
              type="number"
              placeholder="Collection Id"
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-96 h-10 block px-4 text-base font-normal text-[#1A1A1A] rounded-md focus:outline-none"
            />
            <Button onClick={handleQueryCollection} cta="Query Collection" />

            {metadata && (
              <div className="mt-5">
                <CollectionCard metadata={metadata} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Garage;

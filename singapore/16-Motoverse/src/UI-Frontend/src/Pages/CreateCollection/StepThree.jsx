import Button from "../../Components/Common/Buttons/Button";
import addFileCrust from "../../utils/crust/addFile";
import placeStorageOrder from "../../utils/crust/storage";
import setMetadataCollection from "../../utils/nft/collection/setMetadata";
// import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { usePolkaContext } from "../../context/PolkaContext";


const StepThree = () => {
    const { api, selectedAccount } = usePolkaContext();
    const [name] = useState("");
    const [description] = useState("");
    const [image] = useState(null);
    const [ setTempCol] = useState(null);
    // const [metadata, setMetadata] = useState(null);
    const [collectionId] = useState(null);
    // const navigate = useNavigate();
    const [setLoading] = useState(false);

    
    const handleMetadataCrust = async (event) => {
        event.preventDefault();
        setLoading(true);
        if (!Number(collectionId) || collectionId <= 0) {
          alert("Please provide a valid collection ID.");
          return;
        }
    
        let _collectionId = collectionId;
    
        if (!name) {
          alert("Put the name of the collection");
        } else if (!description) {
          alert("Put the description of the collection");
        } else if (!image) {
          alert("Insert the image of the collection");
        } else if (!selectedAccount) {
          alert("Connect your wallet");
        } else {
          try {
            // Upload image to Crust via IPFS
            const ipfsImage = await addFileCrust(image);
            const imageCid = ipfsImage.cid;
            console.log(
              "Image CID with Crust:",
              `https://ipfs.io/ipfs/${imageCid}`
            );
    
            // Create metadata object
            const metadata = {
              name: name,
              description: description,
              image: `https://ipfs.io/ipfs/${imageCid}`,
            };
    
            // Convert metadata to JSON
            const metadataJson = JSON.stringify(metadata);
            console.log("Metadata JSON:", metadataJson);
    
            // Upload metadata to Crust via IPFS
            const metadataBlob = new Blob([metadataJson], {
              type: "application/json",
            });
            const ipfsMetadata = await addFileCrust(metadataBlob);
            const metadataCid = ipfsMetadata.cid;
            console.log(
              "Metadata CID with Crust:",
              `https://ipfs.io/ipfs/${metadataCid}`
            );
    
            // Place the storage order on Crust for the metadata
            const storageOrder = await placeStorageOrder(
              metadataCid,
              ipfsMetadata.size
            );
            console.log("Crust storage order:", storageOrder);
    
            // Set metadata on-chain using the Crust CID
            const crustUrl = `https://ipfs.io/ipfs/${metadataCid}`;
            const response = await setMetadataCollection(
              api,
              selectedAccount,
              _collectionId,
              crustUrl
            );
            console.log("Set metadata response:", response);
    
            setTempCol(crustUrl);
    
            return crustUrl;
          } catch (error) {
            console.error("Error handling metadata with Crust:", error);
          } finally {
            setLoading(false);
          }
        }
      };

  return (
    <div>

    <p>Secure metadata with crust (optional) (more security)</p>
    <button
     className="rounded-3xl bg-darkslategray py-2 m-4 px-s text-left text-white"
    onClick={handleMetadataCrust}>Secure with Crust</button>
    </div>
  )
}

export default StepThree
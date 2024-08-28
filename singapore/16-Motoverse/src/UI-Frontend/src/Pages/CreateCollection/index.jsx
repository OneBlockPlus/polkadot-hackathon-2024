import { useState } from "react";
// import createCollection from "../../utils/nft/collection/create";
// import addFileCrust from "../../utils/crust/addFile";
// import placeStorageOrder from "../../utils/crust/storage";
import { usePolkaContext } from "../../context/PolkaContext";
// import setMetadataCollection from "../../utils/nft/collection/setMetadata";
// import uploadFilePinata from "../../utils/pinata/pin";
// import Button from "../../Components/Common/Buttons/Button";
// import Input from "../../Components/Common/Input";
// import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../../Components/LoadingOverlay";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import Steps from "./Steps";

const CreateCollection = () => {
  // const { api, selectedAccount, getApi } = usePolkaContext();
  // const [name, setName] = useState("");
  // const [description, setDescription] = useState("");
  // const [image, setImage] = useState(null);
  // const [tempCol, setTempCol] = useState(null);
  // const [metadata, setMetadata] = useState(null);
  // const [collectionId, setCollectionId] = useState(null);
  // const navigate = useNavigate();
  const [loading] = useState(false);
  // const [loading, setLoading] = useState(false);

  // const handleCreateCollection = async (event) => {
  //   event.preventDefault();
  //   if (!api) {
  //     alert("Api is not connected");
  //   } else if (!selectedAccount) {
  //     alert("Connect a Wallet");
  //   }  else {
  //     try {
  //       const collection = await createCollection(
  //         api,
  //         selectedAccount
  //       );
  //       console.log(collection);
  //       return collection;
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   }
  // };

  // const handleMetadataCrust = async (event) => {
  //   event.preventDefault();
  //   setLoading(true);
  //   if (!Number(collectionId) || collectionId <= 0) {
  //     alert("Please provide a valid collection ID.");
  //     return;
  //   }

  //   let _collectionId = collectionId;

  //   if (!name) {
  //     alert("Put the name of the collection");
  //   } else if (!description) {
  //     alert("Put the description of the collection");
  //   } else if (!image) {
  //     alert("Insert the image of the collection");
  //   } else if (!selectedAccount) {
  //     alert("Connect your wallet");
  //   } else {
  //     try {
  //       // Upload image to Crust via IPFS
  //       const ipfsImage = await addFileCrust(image);
  //       const imageCid = ipfsImage.cid;
  //       console.log(
  //         "Image CID with Crust:",
  //         `https://ipfs.io/ipfs/${imageCid}`
  //       );

  //       // Create metadata object
  //       const metadata = {
  //         name: name,
  //         description: description,
  //         image: `https://ipfs.io/ipfs/${imageCid}`,
  //       };

  //       // Convert metadata to JSON
  //       const metadataJson = JSON.stringify(metadata);
  //       console.log("Metadata JSON:", metadataJson);

  //       // Upload metadata to Crust via IPFS
  //       const metadataBlob = new Blob([metadataJson], {
  //         type: "application/json",
  //       });
  //       const ipfsMetadata = await addFileCrust(metadataBlob);
  //       const metadataCid = ipfsMetadata.cid;
  //       console.log(
  //         "Metadata CID with Crust:",
  //         `https://ipfs.io/ipfs/${metadataCid}`
  //       );

  //       // Place the storage order on Crust for the metadata
  //       const storageOrder = await placeStorageOrder(
  //         metadataCid,
  //         ipfsMetadata.size
  //       );
  //       console.log("Crust storage order:", storageOrder);

  //       // Set metadata on-chain using the Crust CID
  //       const crustUrl = `https://ipfs.io/ipfs/${metadataCid}`;
  //       const response = await setMetadataCollection(
  //         api,
  //         selectedAccount,
  //         _collectionId,
  //         crustUrl
  //       );
  //       console.log("Set metadata response:", response);

  //       setTempCol(crustUrl);

  //       return crustUrl;
  //     } catch (error) {
  //       console.error("Error handling metadata with Crust:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };

  // const handleMetadataPinata = async (event) => {
  //   event.preventDefault();
  //   let _collectionId = collectionId;
  //   if (!name) {
  //     alert("Put the name of the collection");
  //   } else if (!description) {
  //     alert("Put the description of the collection");
  //   } else if (!image) {
  //     alert("Insert the image of the collection");
  //   } else if (!selectedAccount) {
  //     alert("Connect your wallet");
  //   } else {
  //     try {
  //       const ipfsImage = await uploadFilePinata(image); // Asume que `image` es tu archivo de imagen
  //       const imageCid = ipfsImage.IpfsHash;
  //       console.log(
  //         "Image CID with pinata:",
  //         `https://copper-ready-guanaco-464.mypinata.cloud/ipfs/${imageCid}`
  //       );
  //       const metadata = {
  //         name: name,
  //         description: description,
  //         image: `https://copper-ready-guanaco-464.mypinata.cloud/ipfs/${imageCid}`,
  //       };

  //       const metadataJson = JSON.stringify(metadata);
  //       console.log(metadataJson);

  //       const metadataBlob = new Blob([JSON.stringify(metadata)], {
  //         type: "application/json",
  //       });

  //       const ipfsMetadata = await uploadFilePinata(metadataBlob);
  //       console.log(ipfsMetadata);

  //       const metadataCid = ipfsMetadata.IpfsHash;
  //       console.log(
  //         "CID de la metadata:",
  //         `https://copper-ready-guanaco-464.mypinata.cloud/ipfs/${metadataCid}`
  //       );

  //       const pinataUrl = `https://copper-ready-guanaco-464.mypinata.cloud/ipfs/${metadataCid}`;
  //       const response = await setMetadataCollection(
  //         api,
  //         selectedAccount,
  //         _collectionId,
  //         pinataUrl
  //       );
  //       console.log(response);

  //       setTempCol(pinataUrl);
  //     } catch (error) {
  //       console.error("Error handling metadata with Pinata:", error);
  //     }
  //   }
  // };


  const {selectedTabSteps} = usePolkaContext();

  const renderTabContent = () => {
    switch (selectedTabSteps) {
      case 0:
        return <StepOne />; 
      case 1:
        return <StepTwo  />;
      case 2:
        return  <StepThree />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full relative min-h-screen bg-white-50 overflow-hidden text-center text-[27px] text-black font-text">
      <div className="self-stretch flex flex-row items-start px-10 py-10 gap-[31px] justify-center font-manrope">
      <Steps/>
        {loading && <LoadingOverlay />}
        <div className="flex-1">{renderTabContent()}</div>

        {/* <div>
        <p>2. Set metadata</p>
        <Input
          type="text"
          placeholder="name"
          onChange={(e) => setName(e.target.value)}
          className=" w-[25rem] h-10 block px-4 text-base font-normal text-[#1A1A1A] rounded-md appearance-none focus:outline-none focus:ring-0 peer"
        />
        <Input
          type="text"
          placeholder="Description"
          className="w-[25rem] h-20 block px-4 text-base font-normal text-[#1A1A1A] rounded-md appearance-none focus:outline-none focus:ring-0 peer"
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="py-2 items-center  font-bold text-xl "
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />


      
        <Input
          type="number"
          placeholder="collectionId"
          onChange={(e) => setCollectionId(Number(e.target.value))}
          className=" w-[25rem] h-10 block px-4 text-base font-normal text-[#1A1A1A] rounded-md appearance-none focus:outline-none focus:ring-0 peer"
        />
         <Button onClick={handleMetadataPinata} cta="Set Metadata with Pinata" />
        </div> */}

       
        {/* <p>3. Secure metadata with crust (optional) (more security)</p>
        <Button onClick={handleMetadataCrust} cta="Set Metadata with Crust" /> */}
      </div>
    </div>
  );
};

export default CreateCollection;

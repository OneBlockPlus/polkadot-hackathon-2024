import  { useState} from "react";
import Input from "../../Components/Common/Input";
import Button from "../../Components/Common/Buttons/Button";
import uploadFilePinata from "../../utils/pinata/pin";
import { usePolkaContext } from "../../context/PolkaContext";
import setMetadataCollection from "../../utils/nft/collection/setMetadata";



const StepTwo = () => {
  const {setSelectedTabSteps} = usePolkaContext()

  const handleNextTab = () => {
    setSelectedTabSteps(2);
  };

    const { api, selectedAccount } = usePolkaContext();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [collectionId, setCollectionId] = useState(null);
    const [ setTempCol] = useState(null);
    // const [metadata, setMetadata] = useState(null);


    const handleMetadataPinata = async (event) => {
        event.preventDefault();
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
            const ipfsImage = await uploadFilePinata(image); // Asume que `image` es tu archivo de imagen
            const imageCid = ipfsImage.IpfsHash;
            console.log(
              "Image CID with pinata:",
              `https://copper-ready-guanaco-464.mypinata.cloud/ipfs/${imageCid}`
            );
            const metadata = {
              name: name,
              description: description,
              image: `https://copper-ready-guanaco-464.mypinata.cloud/ipfs/${imageCid}`,
            };
    
            const metadataJson = JSON.stringify(metadata);
            console.log(metadataJson);
    
            const metadataBlob = new Blob([JSON.stringify(metadata)], {
              type: "application/json",
            });
    
            const ipfsMetadata = await uploadFilePinata(metadataBlob);
            console.log(ipfsMetadata);
    
            const metadataCid = ipfsMetadata.IpfsHash;
            console.log(
              "CID de la metadata:",
              `https://copper-ready-guanaco-464.mypinata.cloud/ipfs/${metadataCid}`
            );
    
            const pinataUrl = `https://copper-ready-guanaco-464.mypinata.cloud/ipfs/${metadataCid}`;
            const response = await setMetadataCollection(
              api,
              selectedAccount,
              _collectionId,
              pinataUrl
            );
            console.log(response);
    
            setTempCol(pinataUrl);
            handleNextTab();
          } catch (error) {
            console.error("Error handling metadata with Pinata:", error);
          }
        }
      };
    


  return (
    <div>
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
     <button
        className="rounded-3xl bg-darkslategray py-2 m-4 px-s text-left text-white"
     onClick={handleMetadataPinata} >Set Metadata</button>
    
     {/* <button
        className="rounded-3xl bg-darkslategray py-2 m-4 px-s text-left text-white "
        onClick={handleNextTab}
      >
       Secure with Crust (Optional)
      </button> */}
    
    </div>

  )
}

export default StepTwo
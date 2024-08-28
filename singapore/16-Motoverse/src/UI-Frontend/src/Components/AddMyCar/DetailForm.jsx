import { useState } from "react";
import { usePolkaContext } from "../../context/PolkaContext";
import uploadFilePinata from "../../utils/pinata/pin"; 

const DetailForm = () => {
  const { setSelectedTabAddmycar, ownerInfo, setOwnerInfo, setOwnerInfoHash } = usePolkaContext();
  
  // Estados locales para la información del propietario
  const [firstName, setFirstName] = useState(ownerInfo?.firstName || "");
  const [lastName, setLastName] = useState(ownerInfo?.lastName || "");
  const [address, setAddress] = useState(ownerInfo?.address || "");
  const [country, setCountry] = useState(ownerInfo?.country || "");
  const [zipcode, setZipcode] = useState(ownerInfo?.zipcode || "");

  const handleNextTab = async () => {
    // Actualizar el contexto con la información del propietario
    const updatedOwnerInfo = { firstName, lastName, address, country, zipcode };
    setOwnerInfo(updatedOwnerInfo);

    // Crear JSON con la información del propietario
    const ownerInfoMetadata = JSON.stringify(updatedOwnerInfo);
    const metadataBlob = new Blob([ownerInfoMetadata], { type: "application/json" });

    try {
      // Subir el JSON con la información del propietario a IPFS
      const ipfsMetadata = await uploadFilePinata(metadataBlob);
      const metadataCid = ipfsMetadata.IpfsHash;
      const metadataUrl = `https://copper-ready-guanaco-464.mypinata.cloud/ipfs/${metadataCid}`;
      console.log("CID del JSON con la información del propietario:", metadataUrl);

      // Guardar el URL del JSON en el contexto
      setOwnerInfoHash(metadataUrl);
      
      // Cambiar a la siguiente pestaña
    
      setSelectedTabAddmycar(3); 
    } catch (error) {
      console.error("Error uploading owner info to IPFS:", error);
    }
  };

  return (
    <div className="w-full relative min-h-screen bg-white-50 overflow-hidden text-center text-[27px] text-black font-text">
      <div className="self-stretch flex flex-col lg:flex-row md:flex-row items-start justify-start py-10 px-m lg:px-xl gap-[31px] text-left text-20xl font-manrope-25px-regular mb-6">
        <div className="flex-1 flex flex-col items-start justify-start gap-6 text-center md:gap-12">
          <b className="relative leading-[120%]">Vehicle Owner’s Information</b>
          <div className="self-stretch flex flex-col items-start justify-start gap-5 text-left text-base text-green-900 font-text md:gap-8">
            <div className="self-stretch flex flex-col items-start justify-start gap-5 md:gap-6">
              <div className="w-full flex flex-col items-start justify-start gap-1.5 md:gap-2">
                <div className="flex flex-col items-start justify-start">
                  <b className="relative inline-block">Name</b>
                </div>
                <div className="self-stretch flex flex-col md:flex-row flex-wrap items-start justify-start gap-5 text-grey-500">
                  <input
                    className="flex-1 rounded-xl bg-white-10 flex flex-row items-start justify-start p-3 box-border min-w-[140px] md:min-w-[280px] text-black"
                    type="text"
                    placeholder="First"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <input
                    className="flex-1 rounded-xl bg-white-10 flex flex-row items-start justify-start p-3 box-border min-w-[140px] md:min-w-[280px] text-black"
                    type="text"
                    placeholder="Last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="self-stretch flex flex-col items-start justify-start gap-1.5 md:gap-2">
                <div className="flex flex-col items-start justify-start">
                  <b className="relative inline-block">Address</b>
                </div>
                <input
                  className="self-stretch rounded-xl bg-white-10 flex flex-row items-start justify-start p-3 text-black"
                  type="text"
                  placeholder="Address 1"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="self-stretch flex flex-col md:flex-row items-start justify-start gap-5 md:gap-7">
                <div className="flex-1 flex flex-col items-start justify-start gap-1.5 md:gap-2">
                  <div className="flex flex-col items-start justify-start">
                    <b className="relative inline-block">Country</b>
                  </div>
                  <input
                    className="self-stretch rounded-xl bg-white-10 flex flex-row items-start justify-start py-3 pr-6 pl-3 gap-[10px] text-black"
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
                <div className="flex-1 flex flex-col items-start justify-start gap-1.5 md:gap-2">
                  <div className="flex flex-col items-start justify-start">
                    <b className="relative inline-block">Zipcode</b>
                  </div>
                  <input
                    className="self-stretch rounded-xl bg-white-10 flex flex-row items-start justify-start p-3 text-black"
                    type="text"
                    placeholder="Zipcode"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                  />
                </div>
                <button
                  className="rounded-3xl bg-darkslategray py-2 m-4 px-s text-left text-white"
                  onClick={handleNextTab}
                >
                  Go to Mint NFT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailForm;

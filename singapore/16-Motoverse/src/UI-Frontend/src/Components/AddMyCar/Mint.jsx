// import SaveAndMint from "./Save&Mint";
import Images from "./images";
import VehicleDetail from "./VehicleDetail";
import ConfirmOwnerInfo from "./ConfirmOwnerInfo";
import AvailableDates from "./AvailableDates";
import { Button } from "react-bootstrap";
import LoadingOverlay from "../LoadingOverlay.jsx";
import { useState } from "react";
// import Button from "../../Components/Common/Buttons/Button";
import Input from "../../Components/Common/Input.jsx";
import { usePolkaContext } from "../../context/PolkaContext.tsx";
import mintNFT from "../../utils/nft/item/mint.js";
import setMetadataNFT from "../../utils/nft/item/setMetadata.js";
import uploadFilePinata from "../../utils/pinata/pin.js";
import { web3FromSource } from "@polkadot/extension-dapp";

const MintNFTComponent = () => {
  const { api, selectedAccount, imageHash, ownerInfoHash, detailsHash } =
    usePolkaContext();
  const [loading, setLoading] = useState(false);
  const [collectionId, setCollectionId] = useState(null);
  const [nftId, setNftId] = useState(null);

  const handleCreateItem = async (e) => {
    e.preventDefault();

    if (!selectedAccount) {
      alert("Connect a wallet");
      return;
    }

    setLoading(true);

    try {
      let _collectionId = collectionId;
      let _itemId = nftId;
      let _mintTo = selectedAccount.address;
      const injector = await web3FromSource(selectedAccount.meta.source);

      let unsub = await api.tx.nfts
        .mint(_collectionId, _itemId, _mintTo, 0)
        .signAndSend(
          selectedAccount.address,
          { signer: injector.signer },
          ({ status, events, dispatchError }) => {
            console.log(`Transaction status: ${status.type}`);

            if (dispatchError) {
              if (dispatchError.isModule) {
                const decoded = api.registry.findMetaError(
                  dispatchError.asModule
                );
                const { docs, name, section } = decoded;
                console.error(`Error: ${section}.${name}: ${docs.join(" ")}`);
              } else {
                console.error(`Error: ${dispatchError.toString()}`);
              }
              return; // Exit early if there's a dispatch error
            }

            if (status.isInBlock) {
              console.log(`Included at block hash: ${status.asInBlock}`);
              console.log("Events:");

              events.forEach(({ event: { data } }) => {
                console.log(`\t ${data}`);

                // Assuming the NFT ID is in the first event's data
                if (data[0] && data[0].toString()) {
                  const nftId = data[0].toString(); // Adjust based on actual event structure
                  console.log(`Minted NFT ID: ${nftId}`);
                  alert(`Minted the NFT with ID ${nftId} successfully.`);
                }
              });
              unsub();
            } else if (status.isFinalized) {
              console.log(`Finalized block hash: ${status.asFinalized}`);
            }
          }
        );

      setLoading(false);
      return unsub; // Return the unsubscribe function to potentially clean up later if needed
    } catch (e) {
      console.log(e);
      setLoading(false);
      alert("An error occurred while minting the NFT.");
    }
  };

  const handleSetMetadataItem = async () => {
    setLoading(true);

    const metadata = {
      vehicleDetails: detailsHash,
      vehicleOwner: ownerInfoHash,
      vehicleImages: imageHash,
    };
    const stringMetadata = JSON.stringify(metadata);
    const metadataBlob = new Blob([stringMetadata], {
      type: "application/json",
    });

    const ipfsMetadata = await uploadFilePinata(metadataBlob);
    const metadataCid = ipfsMetadata.IpfsHash;
    const metadataUrl = `https://copper-ready-guanaco-464.mypinata.cloud/ipfs/${metadataCid}`;
    console.log(
      "CID del JSON con la información del propietario:",
      metadataUrl
    );

    // Guardar el URL del JSON en el contexto

    try {
      let meta = setMetadataNFT(
        api,
        selectedAccount,
        collectionId,
        nftId,
        metadataUrl
      );
      console.log(meta);
      setLoading(false);
      return meta;
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
    setLoading(false);
  };

  const testConfig = async () => {
    let _collectionId = collectionId;
    let _itemId = nftId;
    let _mintTo = selectedAccount.address;

    const injector = await web3FromSource(selectedAccount.meta.source);

    let unsub = await api.tx.nfts
      .forceMint(_collectionId, _itemId, _mintTo, 0)
      .signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ status, events, dispatchError }) => {
          console.log(`Transaction status: ${status.type}`);

          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(
                dispatchError.asModule
              );
              const { docs, name, section } = decoded;
              console.error(`Error: ${section}.${name}: ${docs.join(" ")}`);
            } else {
              console.error(`Error: ${dispatchError.toString()}`);
            }
            return; // Exit early if there's a dispatch error
          }

          if (status.isInBlock) {
            console.log(`Included at block hash: ${status.asInBlock}`);
            console.log("Events:");

            events.forEach(({ event: { data } }) => {
              console.log(`\t ${data}`);

              // Assuming the NFT ID is in the first event's data
              if (data[0] && data[0].toString()) {
                const nftId = data[0].toString(); // Adjust based on actual event structure
                console.log(`Minted NFT ID: ${nftId}`);
                alert(`Minted the NFT with ID ${nftId} successfully.`);
              }
            });
          } else if (status.isFinalized) {
            console.log(`Finalized block hash: ${status.asFinalized}`);
            unsub();
          }
        }
      );

    console.log(tx);
  };

  return (
    <>
      {loading && <LoadingOverlay />}
      <div className="w-full relative min-h-screen  overflow-hidden text-center text-[27px] text-black font-text bg-gray-100">
        <div className=" self-stretch flex  lg:flex-row md:flex-row items-start justify-start py-10 px-m lg:px-xl gap-[31px] text-left text-20xl font-manrope-25px-regular mb-6">
          <div className="flex-1  rounded-xl overflow-hidden flex flex-col items-start justify-start relative gap-[40px]">
            <b className="relative leading-[120%] z-[0]">
              Confirm your Information
            </b>
            <div className="self-stretch relative box-border   border-t-[1px] border-solid border-green-200" />
            <VehicleDetail></VehicleDetail>
            <div className="self-stretch relative box-border h-px z-[3] border-t-[1px] border-solid border-green-200" />
            <div className="self-stretch flex flex-col items-start justify-start gap-[16px] z-[4]">
              <div className="self-stretch flex flex-row items-center justify-between">
                <b className="relative leading-[120%]">Images</b>
              </div>
              <div className="self-stretch flex flex-row flex-wrap items-center justify-center p-10 gap-[16px]">
                <Images className="mt-4" />
              </div>
            </div>
            <div className="self-stretch relative box-border h-px z-[5] border-t-[1px] border-solid border-green-200" />
            <ConfirmOwnerInfo />
            <div className="self-stretch relative box-border h-px z-[7] border-t-[1px] border-solid border-green-200" />
            {/* <AvailableDates /> */}
          </div>
        </div>
        {/* <UploadMetadata></UploadMetadata> */}
        {/* <CreateConfig/> */}
        {/* <SetMetaData /> */}

        <div>
          <Input
            type="number"
            placeholder="collectionId"
            onChange={(e) => setCollectionId(Number(e.target.value))}
            className=" w-[25rem] h-10 block px-4 text-base font-normal text-[#1A1A1A] rounded-md appearance-none focus:outline-none focus:ring-0 peer"
          />

          <Input
            type="number"
            placeholder="nftId"
            onChange={(e) => setNftId(Number(e.target.value))}
            className=" w-[25rem] h-10 block px-4 text-base font-normal text-[#1A1A1A] rounded-md appearance-none focus:outline-none focus:ring-0 peer"
          />
          <button
               className="rounded-3xl bg-darkslategray py-2 m-4 px-s text-left text-white"
            onClick={handleCreateItem}
          >
            Create NFT
          </button>
        </div>

        <button
           className="rounded-3xl bg-darkslategray py-2 m-4 px-s text-left text-white "
          onClick={handleSetMetadataItem}
        >
          Set NFT Metadata
        </button>

        {/* <button
          className="rounded-3xl bg-darkslategray py-2 m-4 px-s text-left text-white"
          onClick={testConfig}
        >
          Force Mint
        </button> */}

        {/* <SaveAndMint></SaveAndMint> */}
      </div>
    </>
  );
};

export default MintNFTComponent;

"use client";
import React, { useEffect, useState } from "react";
import ReusableHeading from "../../textComponent";
import TypesComponent from "../../TypesProps";
import MintNftUnique from "./mintUnique";
import { useInnovationContext } from "@/context/innovation";
import { ChainSelector } from "./chainSelector";
import { useAccountsContext } from "@/context/account";
// import Footer from "../Footer";

interface ConfirmationModalProps {

  onClose: () => void; // Function to close the modal
  onEditPage: (page: number) => void; // Function to allow editing specific page

}

interface NFTMetadata {
  name: string;
  technicalName: string;
  description: string;
  type: string;
  useDate: string;
  registryNumber: string;
  collectionId: number;
  image: string[];
}




const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  onClose,
  onEditPage,
}) => {

 const {chain, setChain, nftMetadataUrl} = useInnovationContext();

 const {selectedAccount} = useAccountsContext()
  // Handle both close and edit in one function
  const handleEditPage = (page: number) => {
    const tabKeys = ["collections", "nfts", "contracts"];
    // setActiveTab(tabKeys[page - 1]);
    onEditPage(page); // Open the page to edit
    onClose(); // Close the modal
  };

  const [nftData, setNftData] = useState<NFTMetadata>();



  async function fetchNFTData(url: string | null): Promise<NFTMetadata | null> {
    if (!url) {
      console.error("No URL provided");
      return null;
    }
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching NFT data:", error);
      throw error;
    }
  }

 // En el useEffect
useEffect(() => {
  const loadNFTData = async () => {
    try {
      const data = await fetchNFTData(nftMetadataUrl);
      if (data) {
        setNftData(data);
      }
    } catch (error) {
      console.error("Error loading NFT data:", error);
    }
  };

  loadNFTData();
}, [nftMetadataUrl]); // Agregar 



const [nftV1, setNftV1] = useState<object>({
  name: 0,
  description: 0,
  fillingDate:0,
  jurisdiction: 0,
})


  return (
    <>
      <div className="flex flex-col inset-0 fixed items-center justify-center bg-black bg-opacity-50 z-50 w-full md:max-w-5xl mx-auto max-h-[100vh] ">
        <div className=" bg-[#1C1A11] rounded-md justify-center items-center w-full relative z-50 pt-[120px] px-[100px] overflow-y-auto gap-[60px] scrollable">
          <div className="flex flex-col gap-[60px] items-start w-full">
            <div className="w-full flex flex-col items-center gap-[60px]">
              <div className="flex flex-col items-start gap-[60px] w-full">
                <div>
                  <ReusableHeading text="Confirmation " />
                  <TypesComponent
                    text="Please confirm your details before submitting"
                    className="text-[#8A8A8A]"
                  />
                </div>
                <div className="flex items-start gap-[60px] self-stretch w-full">
                 
                  {/* Left hand starts */}
                    <div className="flex flex-col items-start gap-[60px] w-full">
                       {/* page 1 starts */}
                      <div className="flex w-full items-start self-stretch justify-start gap-[60px]">
                        {/* page 1 starts */}
                        <div className="flex flex-col w-full items-start gap-[60px] self-stretch">
                          <div className="flex flex-col gap-[8px]">
                            <TypesComponent
                              className="font-bold"
                              text="Types of Intellectual Property"
                            />

                            <TypesComponent
                              className="text-[#8A8A8A]"
                              text={`
                          ${
                             nftData?.type||
                            "N/A"
                          }`}
                            />
                          </div>

                          <div className="flex flex-col gap-[8px]">
                            <TypesComponent
                              className="font-bold"
                              text="Reference Number"
                            />

                            {/* <TypesComponent
                              className="text-[#8A8A8A]"
                              text={`
                      ${formData.IpRegistries.ReferenceNumber || "N/A"}`}
                            /> */}

                            {/* <p>
                      Reference Number:{" "}
                      {formData.IpRegistries?.ReferenceNumber || "N/A"}
                    </p> */}
                          </div>

                          <div className="flex flex-col gap-[8px]">
                            <TypesComponent
                              className="font-bold"
                              text="Reference Link"
                            />

                            <TypesComponent
                              className="text-[#8A8A8A]"
                              text={`
                        ${nftData?.registryNumber|| "N/A"}
                        `} 
                            />
                          </div>
                        </div>
                        {/* page 1 ends */}
                        
                        <button
                          onClick={() => handleEditPage(1)}
                          className="text-[#F6E18B] w-full md:w-[30.02px]"
                        >
                          <img src="/images/EditIcon.svg"
                          className="shrink-0"
                          loading="lazy"
                          alt="Edit" />
                        </button> 
                      </div>
                       {/* page 1 starts */}

                      <div className="w-[270px] h-[1px] flex bg-[#8A8A8A]"></div>

                      {/* page 2 starts */}
                      <div className="flex w-full items-start self-stretch justify-start gap-[60px]">
                        <div className="flex flex-col items-start gap-[60px] self-stretch">
                          {/* Types of patent start */}
                          <div className="flex flex-col gap-[8px]">
                            <TypesComponent
                              className="font-bold"
                              text="Types of Patent"
                            />
                            <TypesComponent
                              className="text-[#8A8A8A]"
                              text={`${
                                nftData?.name || "N/A"
                              }`}
                            />
                          </div>
                          {/* Types of patent start */}

                          {/* Patent Title start*/}
                          <div className="flex flex-col gap-[8px]">
                            <TypesComponent
                              className="font-bold"
                              text="Patent Title"
                            />
                            <TypesComponent
                              className="text-[#8A8A8A]"
                              text={`${nftData?.name || "N/A"}`}
                            />
                          </div>
                          {/* Patent Title ends */}

                          {/* Patent Number and Filling date starts */}
                          <div className="flex items-center justify-center w-full gap-[60px] self-stretch">
                            {/* patent number */}
                            <div className="flex flex-col items-start w-full gap-[8px]">
                              <TypesComponent
                                className="font-bold"
                                text="Patent Number"
                              />
                              <TypesComponent
                                className="text-[#8A8A8A]"
                                text={`${
                                  nftData?.registryNumber || "N/A"
                                }`}
                              />
                            </div>
                            {/* patent number ends */}

                            {/* filling date starts */}
                            <div className="flex flex-col items-start w-full gap-[8px]">
                              <TypesComponent
                                className="font-bold "
                                text="Filling Date"
                              />
                              <TypesComponent
                                className="text-[#8A8A8A]"
                                text={`${
                                  nftData?.useDate || "N/A"
                                }`}
                              />
                            </div>
                            {/* Filling Date ends */}
                          </div>

                          {/* Patent Number and Filling date ends*/}
                        </div>

                        <button
                          onClick={() => handleEditPage(2)}
                          className="text-[#F6E18B]"
                        >
                          <img src="/images/EditIcon.svg" className="shrink-0" loading="lazy"  alt="Edit" />
                        </button>
                      </div>
                      {/* page 2 ends */}  
                    </div>
                  {/* Left hand ends */}

                  <div className="w-[1px] h-[700px] bg-[#8A8A8A]"></div>

                  {/* right hand starts */}
                  <div className="flex items-start gap-[60px] self-stretch w-full">
                    {/* page 3 starts */}
                    <div className="flex flex-col items-start gap-[60px] self-stretch">
                      <div className="flex flex-col gap-2">
                        <TypesComponent text="Thumbnail Image" />
                        <p>
                          Files Uploaded:{""}{" "}
                          {nftData?.image|| "No file uploaded"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <TypesComponent text="NFT Name" className="font-bold" />
                        <TypesComponent
                          className="text-[#8A8A8A]"
                          text={`${nftData?.technicalName || "N/A"}`}
                        />
                      </div>
                

                      <div className="flex flex-col gap-2">
                        <TypesComponent text="Types of Protection" />
                        <TypesComponent
                          className="text-[#8A8A8A]"
                          text={
                            nftData?.type || "N/A"
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-[8px]">
                        <TypesComponent
                          className="font-bold"
                          text="Description"
                        />

                        <TypesComponent
                          className="text-[#8A8A8A]"
                          text={nftData?.description || "N/A"}
                        />
                      </div>
                    </div>

                    {/* page 3 ends */}
                    <button
                      onClick={() => handleEditPage(3)}
                      className="text-[#F6E18B]"
                    >
                      <img src="/images/EditIcon.svg" className="shrink-0" alt="Edit" />
                    </button>
                  </div>
                  {/* page 3, right hand side ends */}
                </div>
              </div>
            </div>

            <div className="flex mt-8 justify-between w-full ">
              <button
                className="bg-transparent w-[160px] rounded-[16px] px-[20px] py-[8px] flex-shrink-0 border border-[#D0DFE4] text-[#D0DFE4] hover:bg-[#FACC15]  hover:text-[#1C1A11] hover:border-none"
                onClick={onClose}
              >
                Back
              </button>

              <ChainSelector/>
              {/* {chain==="softlaw" && <button onClick={mintNFT}>MINT WITH SOFTLAW</button>}
              
              {chain ==="unique" && <MintNftUnique />} */}
             
            </div>
          </div>
          
          {/* <Footer width="w-full" className="mt-[120px]" /> */}
        </div>
      </div>
    </>
  );
};

export default ConfirmationModal;

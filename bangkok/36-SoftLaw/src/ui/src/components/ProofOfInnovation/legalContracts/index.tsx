'use client'
import MaxWidthWrapper from "@/components/MaxWidhWrapper";
import ReusableHeading from "../textComponent";
import TypesComponent from "../TypesProps";
import VariousTypesButton from "../VariousTypesButton";
import InputField from "../input";
import Link from "next/link";
import Footer from "@/components/Footer";
import UploadFilesField from "../UploadFileField";
import { useContext, useState, useEffect } from "react";
import CollectionTypes from "@/utils/collectionTypes.json";
import { FormDataContext } from "../FormDataContext";
import ConfirmationModal from "../ConfirmationModal";

interface LegalContractsProps {
  onDataChange?: (data: any) => void;
}

export default function LegalContracts({ onDataChange }: LegalContractsProps) {
  const {formData, updateFormData} = useContext(FormDataContext);

  const callOnDataChange = () => {
    onDataChange && onDataChange(formData);
  };

  useEffect(() => {
    callOnDataChange();
  }, [formData, onDataChange]);
  
  // const [formData, setFormData] = useState({
  //   IpRegistries: {
  //     UploadFile: [],
  //     TypeOfIntellectualProperty: '',
  //     ReferenceNumber: '',
  //     ReferenceLink: '',
  //   },
  //   Identity: {
  //     TypeOfPatent: '',
  //     PatentTitle: '',
  //     FillingDate: null,
  //     PatentNumber: '',
  //   },
  //   LegalContracts: {
  //     UploadFile: null,
  //     NFTName: '',
  //     Collection: '',
  //     TypesOfProtection: '',
  //     Description: '',
  //   },
  // })

  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("collections");

  const [collection, setCollection] = useState({
    name: "",
    description: "",
    prefix: "",
    image: "",
  });

  const handleFileUpload = (file: File) => {
    updateFormData("LegalContracts", { UploadFile: file });
    // onDataChange(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData("LegalContracts", { NFTName: e.target.value });
    // onDataChange(formData);
  };

  const handleSelectCollection = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData("LegalContracts", { Collection: e.target.value });
    // onDataChange(formData);
  };
  

  const handleEditPage = (page: number) => {
    // Assuming 'collections' = page 1, 'nfts' = page 2, 'contracts' = page 3
    const tabKeys = ["IpRegistries", "Identity", "LegalContracts"];
    setActiveTab(tabKeys[page - 1]); // Navigate to the right tab/page
  };
  const handleDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData("LegalContracts", { Description: e.target.value });
    // onDataChange(formData);
  };

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
    updateFormData("LegalContracts", { TypesOfProtection: buttonName });
  };

  const handleSubmit = () => {
    // Handle final form submission
    console.log("Final form data:", formData);
    handleOpenModal();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


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


  ////// create nft function ////



  
  return (
    <>
      <div className="bg-[#1C1A11] flex flex-col w-full justify-center items-center text-white min-[2000px]:w-[2560px]">
        <MaxWidthWrapper className="flex flex-col self-stretch min-[2000px]:min-h-screen pt-[120px] justify-center items-center">
          <div className="flex flex-col w-full justify-items-center gap-[60px] pb-[120px]">
            <div>
              <ReusableHeading
                text="NFT DETAIL"
                detail="This  will be visible and encrypted within this NFT on the blockchain."
                className="text-[#8A8A8A]"
              />
            </div>
            <form action="" className="flex flex-col gap-[60px]">
              <UploadFilesField
                text="Thumbnail Image"
                files="files"
                fileType={` Recommended size: 350 x 350. File types: JPG, PNG, SVG, or GIF`}
                onFileUpload={handleFileUpload}
              />

              <div className="flex items-start gap-[60px]">
                <div className="flex flex-col items-start gap-[6px]">
                  <InputField
                    label="NFT Name"
                    hasDropdown={false}
                    className=" min-w-[280px] w-full text-[#fff]"
                    type="text"
                    value={formData.LegalContracts.NFTName}
                    onChange={handleInputChange}
                  />

                  <TypesComponent
                    className="text-[#8A8A8A] "
                    text={`Enter a name that can match your patent name, making it easily searchable. Choose a descriptive and unique name for clear identification.`}
                  />
                </div>

                <div className="flex flex-col items-start gap-[6px]">
                 
                  <InputField
                    label="Collection"
                    placeholder="select a collection"
                    value={formData.LegalContracts.Collection}
                    onChange={handleSelectCollection}
                    type="selection"
                    className=" w-[280px]"
                  />

                   <InputField
                    id="collectionSelect"
                    label="Select a collection"
                    value={collection.name}
                  >
                    {/* <option value="" className="text-balck bg-[#1C1A11]">
                      Select a collection
                    </option> */}
                   
                     {`${CollectionTypes.map((type, index) => (
                      <option key={index} value={type.name}>
                        {type.name}
                      </option>
                    ))} `}
                  
                    
                  </InputField>
                </div>
              </div>

              <div className="flex flex-col items-start self-stretch gap-[8px]">
                <InputField
                  value={formData.LegalContracts.Description}
                  hasDropdown={false}
                  label="Description"
                  className="pr-[24px] h-[123px] pl-[12px] min-w-[280px] text-white"
                  onChange={handleDescription}
                />
                <TypesComponent
                  text="Write a short description which should clearly describe your product."
                  className=" text-[#8A8A8A] "
                />
              </div>
            </form>
            <TypesComponent
              text="Types of protection"
              className="text-[#fff]"
            />
            <div className="flex items-start space-x-4 gap-[16px] self-stretch">
              <VariousTypesButton
                isActive={activeButton === "NFT-based protection"}
                img="/images/shield.svg"
                className={`h-[auto] ${
                  activeButton === "NFT-based protection"
                    ? "border-[#FACC15] bg-[#373737]"
                    : "border-[#8A8A8A]"
                } text-[#D0DFE4] hover:border-[#FACC15] hover:bg-[#373737]`}
                width="full"
                text="NFT-based protection"
                detail="Secure your creation by turning it into an NFT, providing instant blockchain-based ownership and protection against unauthorized use.

                Recommend For: Creators looking for instant, blockchain-based security for their creations."
                onClick={() => {
                  handleButtonClick("NFT-based protection");
                }}
              />
              <VariousTypesButton
                isActive={
                  activeButton ===
                  "NFT-Based Protection + Jurisdiction Registries"
                }
                img="/images/yellowshield.svg"
                className={`h-[auto] ${
                  activeButton ===
                  "NFT-Based Protection + Jurisdiction Registries"
                    ? "border-[#FACC15] bg-[#373737]"
                    : "border-[#8A8A8A]"
                } text-[#D0DFE4] hover:border-[#FACC15] hover:bg-[#373737]`}
                width="full"
                text="NFT-Based Protection + Jurisdiction Registries"
                detail="Boost your protection by registering your NFT with legal authorities globally, combining blockchain security with legal recognition across jurisdictions. Recommended for: Creators seeking comprehensive protection, combining blockchain security with legal jurisdictional safeguards."
                onClick={() => {
                  handleButtonClick(
                    "NFT-Based Protection + Jurisdiction Registries"
                  );
                }}
              />
            </div>
            <div className="flex items-start justify-between w-full ">
              <Link
                href="/Identity"
                className="bg-transparent rounded-[16px] px-[20px] py-[8px] min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl w-[128px] min-[2000px]:w-[200px] items-center text-center flex-shrink-0 border border-[#D0DFE4] text-[#D0DFE4] hover:bg-[#FACC15]  hover:text-[#1C1A11] hover:border-none"
                children="Back"
              />
              
              <div>
                {/* Once the final page is completed, submit */}
                <button
                  onClick={handleOpenModal}
                  className="bg-transparent rounded-[16px] px-[20px] py-[8px] min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl w-[128px] min-[2000px]:w-[200px] items-center text-center flex-shrink-0 border border-[#D0DFE4] text-[#D0DFE4] hover:bg-[#FACC15] hover:text-[#1C1A11] hover:border-none"
                >
                  Submit
                </button>

                {isModalOpen && (
                  <ConfirmationModal
                    formData={formData}
                    onClose={handleCloseModal}
                    onEditPage={handleEditPage}
                    onSubmit={handleSubmit}
                  />
                )}
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
      <Footer
        width="py-[60px] max-h-[400px]"
        className="border-t-[1px] border-[#8A8A8A] w-full"
      />
    </>
  );
}

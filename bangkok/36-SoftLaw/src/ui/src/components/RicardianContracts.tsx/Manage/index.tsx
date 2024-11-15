"use client";
import React, { useEffect, useState } from "react";
// import { getSubstrateSigner } from "@/utils/getSigner";
import MaxWidthWrapper from "@/components/MaxWidhWrapper";
import { useToast } from "../../../hooks/use-toast";
import Footer from "@/components/Footer";
import ReusableHeading from "../textComponent";
import TypesComponent from "../TypesProps";
import InputField from "../input";
import UploadFilesField from "../UploadFileField";
import abi from "../../../utils/abi_minter.json";
import VariousTypesButton from "../VariousTypesButton";

import { useContext } from 'react';
import { FormDataContext } from "../FormDataContext";

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


interface IpRegistriesProps {
  onDataChange: (data: any) => void;
}


export default function IpRegistries ({onDataChange}: IpRegistriesProps) {
  const {formData, updateFormData} = useContext(FormDataContext);

  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
    updateFormData("IpRegistries", { TypeOfIntellectualProperty: buttonName })
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('IpRegistries', { ReferenceNumber: e.target.value });
    onDataChange(formData);
  };

  const handleReferenceLink = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('IpRegistries', { ReferenceLink: e.target.value });
    onDataChange(formData);
  };

  const handleFileUpload = (file: File) => {
    updateFormData('IpRegistries', { UploadFile: file });
    onDataChange(formData);
  }

  const [loading, setLoading] = useState<boolean | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [collection, setCollection] = useState({
    name: "",
    description: "",
    prefix: "",
    image: "",
  });


  const handleSelectTypePatentCollection = async () => {
    console.log(collection);
    setCollection({
      name: "patent",
      description:
        "A collection to create Patents property proofs, giving exclusive right over the use.",
      prefix: "pt",
      image:
        "https://harlequin-quiet-smelt-978.mypinata.cloud/ipfs/QmY6zjfSQoS6txxrFPprrPG1rmuh4akkeAPDCspyDiR41j",
    });
  };

  const handleSelectTypeTrademarkCollection = async () => {
    console.log(collection);
    setCollection({
      name: "trademark",
      description:
        "A collection to create TradeMarks property proofs, giving exclusive rights over the use.",
      prefix: "TM",
      image:
        "https://copper-ready-guanaco-464.mypinata.cloud/ipfs/QmTv2MpubcyxaRguzNMCvQ9pQaqfxgbcxgqLLkCfsE7wcF",
    });
  };

  const handleSelectTypeCopyRightCollection = async () => {
    console.log(collection);
    setCollection({
      name: "copyright",
      description:
        "A collection to create Copyright property proofs, giving exclusive rights over the use.",
      prefix: "CCC",
      image:
        "https://harlequin-quiet-smelt-978.mypinata.cloud/ipfs/QmUAFzr4JvuvZH6dbVHGDCcVdVd3ka9C5Aiv3axJc34tfy",
    });
  };

  const abiTyped = abi as Abi;

  const handleMintCollection = async () => {
    console.log("uploadIpfS and Mint")
  }


  // flor linda michella

  return (
    <div className="bg-[#1C1A11] flex flex-col flex-shrink-0 w-full justify-center items-center text-white min-[2000px]:w-[1280px]">
     
      <MaxWidthWrapper className="flex flex-col self-stretch min-[2000px]:min-h-[800px] pt-[120px] justify-center items-center">
        <div className="flex flex-col w-full justify-items-center gap-[60px] pb-[120px]">
          <div>
            <ReusableHeading text="intellectual property Management" />
          </div>

          <div className="flex flex-col items-start self-stretch gap-[16px] ">
            <TypesComponent text="Types of Intellectual Property" />
            <TypesComponent
              className="text-[#8A8A8A]"
              text="You can create three types of collections—patents, trademarks, or copyrights—each allowing you to mint tokens that serve as proof of ownership for your creations. These collections offer a flexible solution for protecting and managing intellectual property, ensuring that your rights to inventions, brand elements, or creative works are securely recorded and recognized."
            />

            <div className="flex items-start space-x-4 self-stretch">
              <VariousTypesButton
                isActive={activeButton === "Patent"}
                className={`h-[auto] ${
                  activeButton === "Patent"
                    ? "border-[#FACC15] bg-[#373737]"
                    : "border-[#8A8A8A]"
                } text-[#D0DFE4] hover:border-[#FACC15] hover:bg-[#373737]`}
                width="full"
                text="Patent"
                detail="A patent protects inventions or designs. It gives you the exclusive right to make, use, sell, and import the patented invention or design for a limited period."
                onClick={() => {
                  handleSelectTypePatentCollection();
                  handleButtonClick("Patent");
                }}
              />
              <VariousTypesButton
                isActive={activeButton === "Trademark"}
                className={`h-[auto] ${
                  activeButton === "Trademark"
                    ? "border-[#FACC15] bg-[#373737]"
                    : "border-[#8A8A8A]"
                } text-[#D0DFE4] hover:border-[#FACC15] hover:bg-[#373737]`}
                width="full"
                text="Trademark"
                detail="A trademark protects brand elements like names, logos, slogans, or symbols that identify and distinguish goods or services. Example: A company logo or product name."
                onClick={() => {
                  handleSelectTypeTrademarkCollection();
                  handleButtonClick("Trademark");
                }}
              />

              <VariousTypesButton
                isActive={activeButton === "Copyright"}
                className={`h-[auto] ${
                  activeButton === "Copyright"
                    ? "border-[#FACC15] bg-[#373737]"
                    : "border-[#8A8A8A]"
                } text-[#D0DFE4] hover:border-[#FACC15] hover:bg-[#373737]`}
                width="full"
                text="Copyright"
                detail="Copyright protects original works like art, music, literature, and software, giving creators exclusive rights to use and control their work."
                onClick={() => {
                  handleSelectTypeCopyRightCollection();
                  handleButtonClick("Copyright");
                }}
              />

            </div>
          </div>
          <form
            action=""
            className="flex flex-col gap-[60px]"
          >
            <div className="flex flex-col items-start self-stretch gap-[8px]">
              <InputField
              type={"text"}
                label="Reference number"
                className="min-[2000px]:w-[1254px]"
                value={formData.IpRegistries.ReferenceNumber} //Display current state value
                onChange={handleInputChange} //this captures the user's input and updates the global form state
              />
              <TypesComponent
                className="text-[#8A8A8A]"
                text="Eg: Reference number from the USPTO or WIPO database. This number is used to track your application throughout the examination process and may differ from the final patent number. Example: 16/123,456."
              />
              <div className="flex flex-col items-center self-stretch gap-[8px]">
                {collection.name && (
                  <div className="mt-4 text-[#8A8A8A] w-1/2">
                    <h3 className="text-white ">Selected Collection</h3>
                    <p className="mt-2">
                      <strong className="text-white ">Name:</strong>{" "}
                      {collection.name}
                    </p>
                    <p className="mt-2">
                      <strong className="text-white">Description:</strong>{" "}
                      {collection.description}
                    </p>
                    <p className="mt-2 mb-2">
                      <strong className="text-white ">Prefix:</strong>{" "}
                      {collection.prefix}
                    </p>
                    {collection.image && (
                      <img
                        src={collection.image}
                        alt={`${collection.name} logo`}
                        style={{ width: "100px" }}
                      />
                    )}
                    <button
                      className="bg-[#D0DFE4] mt-2 rounded-[16px] text-[#1C1A11] px-[22px] py-[8px] flex-shrink-0 hover:bg-[#FACC15]"
                      onClick={handleMintCollection}
                    >
                      Mint Collection
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-[16px] w-full md:w-full mt-[60px]">
                <UploadFilesField
                  text="Intellectual Property Documentation"
                  files="files"
                  fileType={` File types: Doc, PDF`}
                  onFileUpload={handleFileUpload} //pass the handler for file upload
                />

                <InputField
                type="text"
                  label="or paste a link to the document"
                  className="min-[2000px]:w-[1254px]"
                  hasDropdown={false}
                  value={formData.IpRegistries.ReferenceLink} //Display current state value
                  onChange={handleReferenceLink} //handle input of link
                />
              </div>
            </div>
          </form>

          <div className="flex items-start justify-between w-full ">
  
            <button className="bg-transparent rounded-[16px] px-[20px] py-[8px] flex-shrink-0 border border-[#D0DFE4] text-[#D0DFE4] hover:bg-[#FACC15]  hover:text-[#1C1A11] hover:border-none">
              Cancel
            </button>

            <button className="bg-[#D0DFE4] rounded-[16px] text-[#1C1A11] px-[22px] py-[8px] flex-shrink-0 hover:bg-[#FACC15]">
              Next
            </button>
          </div>
        </div>
      </MaxWidthWrapper>
      <Footer
        width="py-[60px] max-h-[400px]"
        className="border-t-[1px] border-[#8A8A8A] w-full"
      />
    </div>
  );
}

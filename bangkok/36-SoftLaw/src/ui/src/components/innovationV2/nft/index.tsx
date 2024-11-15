"use client";
import MaxWidthWrapper from "@/components/MaxWidhWrapper";
import ReusableHeading from "../../textComponent";
import TypesComponent from "../../TypesProps";
import React, { useState } from "react";
import VariousTypesButton from "../../VariousTypesButton";
import { useInnovationContext } from "@/context/innovation";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function IpData() {
  const {
    selectedTabInnovation,
    setSelectedTabInnovation,
    nftMetadata,
    setNftMetadata,
    setLoading,
  } = useInnovationContext();

  const [activeButton, setActiveButton] = useState<string | null>(null);

  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (!name) return;

    if (name) {
      setNftMetadata({
        ...nftMetadata,
        [name]: value,
      });
    }
  };

  const handleBack = async () => {
    try {
      setSelectedTabInnovation("1");
      console.log("test", selectedTabInnovation);
    } catch (e) {
      console.log(e);
    }
  };

  const handleNext = async () => {
    try {
      setSelectedTabInnovation("3");
      console.log("test", selectedTabInnovation);
    } catch (e) {
      console.log(e);
    }
  };

  const PROTECTION_TYPES = {
    NFT_BASED: "NFT-based protection",
    NFT_JURISDICTION: "NFT-Based Protection + Jurisdiction Registries",
  } as const;

  const handleProtectionTypeSelect = (
    e: React.MouseEvent<HTMLDivElement>,
    protectionType: string
  ) => {
    e.preventDefault();
    try {
      setLoading(true);
      setActiveButton(protectionType);
      setNftMetadata({
        ...nftMetadata,
        type: protectionType,
      });

      toast({
        title: "Protection Type Selected",
        description: `Selected: ${protectionType}`,
        className: "bg-[#252525] text-white border-[#373737]",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Selecting Protection Type",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-[#1C1A11] flex flex-col w-full justify-center items-center text-white min-[2000px]:w-[3000px]">
        <MaxWidthWrapper className="flex flex-col self-stretch pt-[120px] justify-center items-center">
          <div className="flex flex-col w-full justify-items-center pb-[120px] gap-[60px]">
            <ReusableHeading
              text="NFT DETAIL"
              detail="This  will be visible and encrypted within this NFT on the blockchain."
              className="text-[#8A8A8A]"
            />

            <div className="flex flex-col gap-[16px] pt-[60px]">
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
                  onClick={(e) =>
                    handleProtectionTypeSelect(e, PROTECTION_TYPES.NFT_BASED)
                  }
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
                  onClick={(e) =>
                    handleProtectionTypeSelect(
                      e,
                      PROTECTION_TYPES.NFT_JURISDICTION
                    )
                  }
                />
              </div>

              <div className="flex items-start mt-[60px] gap-[60px]">
                <div className="flex flex-col items-start gap-[6px]">
                  <TypesComponent text="Name" className="text-[#fff]" />
                  <Input
                    className={`text-[20px] min-[2000px]:text-2xl flex min-[2000px]:w-6/6 w-full mt-[6px] h-auto text-[#fff]  p-3 items-start gap-[10px] self-stretch bg-[#27251C] outline-none border-none focus:outline-none pr-10 rounded-md focus:ring-1 focus:ring-[#FACC15] min-w-[280px]`}
                    name="name"
                    value={nftMetadata.name}
                    onChange={handleInputChange}
                  />
                  <h1 className="font-Montesarrat text-[16px] font-normal leading-[145%] tracking-[0.32px] min-[2000px]:text-3xl min-[2000px]:tracking-[1px] pt-3 text-[#8A8A8A]">
                    Enter a name that can match your patent name, making it
                    easily searchable. Choose a descriptive and unique name for
                    clear identification.
                  </h1>
                </div>
                <div className="flex flex-col items-start self-stretch gap-[8px]">
                  <TypesComponent
                    text="Technical Name"
                    className="text-[#fff]"
                  />
                  <Input
                    className={`text-[20px] min-[2000px]:text-2xl flex min-[2000px]:w-6/6 w-full mt-[6px] h-auto text-[#fff]  p-3 items-start gap-[10px] self-stretch bg-[#27251C] outline-none border-none focus:outline-none pr-10 rounded-md focus:ring-1 focus:ring-[#FACC15] min-w-[280px]`}
                    name="technicalName"
                    value={nftMetadata.technicalName}
                    onChange={handleInputChange}
                  />
                  <h1 className="font-Montesarrat text-[16px] font-normal leading-[145%] tracking-[0.32px] min-[2000px]:text-3xl min-[2000px]:tracking-[1px] pt-3 text-[#8A8A8A]">
                    Enter the technical legal-name that can match your patent
                    name, making it easily searchable. Choose a descriptive and
                    unique name for clear identification.
                  </h1>
                </div>
              </div>

              <div className="flex items-start mt-[60px] gap-[60px]">
                <div className="flex flex-col items-start self-stretch gap-[8px] w-full">
                  <TypesComponent text="Description" className="text-[#fff]" />
                  <Input
                    className={`text-[20px] min-[2000px]:text-2xl flex min-[2000px]:w-6/6 w-full mt-[6px] h-auto text-[#fff]  p-3 items-start gap-[10px] self-stretch bg-[#27251C] outline-none border-none focus:outline-none pr-10 rounded-md focus:ring-1 focus:ring-[#FACC15] min-w-[280px]`}
                    name="description"
                    value={nftMetadata.description}
                    onChange={handleInputChange}
                  />
                  <h1 className="font-Montesarrat text-[16px] font-normal leading-[145%] tracking-[0.32px] min-[2000px]:text-3xl min-[2000px]:tracking-[1px] pt-3 text-[#8A8A8A]">
                    Write a short description which should clearly describe your
                    product.
                  </h1>
                </div>
              </div>

              <div className="flex items-start mt-[60px] gap-[60px]">
                <div className="flex flex-col items-start gap-[6px]">
                  <TypesComponent
                    text="Registration Number"
                    className="text-[#fff]"
                  />
                  <Input
                    className={`text-[20px] min-[2000px]:text-2xl flex min-[2000px]:w-6/6 w-full mt-[6px] h-auto text-[#fff]  p-3 items-start gap-[10px] self-stretch bg-[#27251C] outline-none border-none focus:outline-none pr-10 rounded-md focus:ring-1 focus:ring-[#FACC15] min-w-[280px]`}
                    name="registryNumber"
                    value={nftMetadata.registryNumber}
                    onChange={handleInputChange}
                  />
                  <h1 className="font-Montesarrat text-[16px] font-normal leading-[145%] tracking-[0.32px] min-[2000px]:text-3xl min-[2000px]:tracking-[1px] pt-3 text-[#8A8A8A] w-full">
                    A unique identifier issued once your patent is officially
                    approved and published to track and reference your patent in
                    legal. <span className="block">Example: US1234567B1.</span>
                  </h1>
                </div>

                <div className="flex flex-col items-start self-stretch gap-[8px]">
                <TypesComponent
                    text="First Date Use"
                    className="text-[#fff]"
                  />
                <Input
                    className={`text-[20px] min-[2000px]:text-2xl flex min-[2000px]:w-6/6 w-full mt-[6px] h-auto text-[#fff]  p-3 items-start gap-[10px] self-stretch bg-[#27251C] outline-none border-none focus:outline-none pr-10 rounded-md focus:ring-1 focus:ring-[#FACC15] min-w-[280px]`}
                    name="useDate"
                  value={nftMetadata.useDate}
                  onChange={handleInputChange}
                  type="Date"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start justify-between w-full ">
              <button
                className="bg-transparent rounded-[16px] px-[20px] py-[8px] w-[128px] items-center text-center min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl min-[2000px]:w-[200px] flex-shrink-0 border border-[#D0DFE4] text-[#D0DFE4] hover:bg-[#FACC15]  hover:text-[#1C1A11] hover:border-none"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="bg-[#D0DFE4] min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl w-[128px] min-[2000px]:w-[200px] items-center text-center rounded-[16px] text-[#1C1A11] px-[22px] py-[8px] flex-shrink-0 hover:bg-[#FACC15]"
              >
                Next
              </button>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    </>
  );
}

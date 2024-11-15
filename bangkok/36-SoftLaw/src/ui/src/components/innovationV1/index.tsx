"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInnovationContext } from "@/context/innovation";
import NFT2 from "./nft/ipDetails";
import NFT from "./nft";

function InovationContent() {
  const { selectedTabInnovation, setSelectedTabInnovation } =
    useInnovationContext();

  const [formData, setFormData] = useState({
    // IpProofData: {
    //   UploadFile: [],
    //   TypeOfIntellectualProperty: "",
    //   ReferenceNumber: "",
    //   ReferenceLink: "",
    // },
    CollectionData: {
      collectionName: "",
      collectionDescription: "",
      FillingDate: null,
      PatentNumber: "",
    },
    nftData: {
      UploadFile: null,
      NFTName: "",
      Collection: "",
      TypesOfProtection: "",
      Description: "",
    },
  });

  const handleFormDataChange = (tab: string, data: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [tab]: data,
    }));
  };

  return (
    <div>
      {/* <div className="text-center">
        <ReusableHeading text="Proof of Innovation" />
      </div> */}

      <Tabs
        value={selectedTabInnovation}
        onValueChange={setSelectedTabInnovation}
        className="bg-[#1C1A11] pt-[90px]"
      >
        <TabsList className="flex items-center min-[2000px]:w-[3000px] bg-[#1C1A11]">
          
         
          <div className="flex items-center space-x-2">
            <TabsTrigger
              value="1"
              className={`px-4 py-2 space-x-2 min-[2000px]:space-x-4 ring-0 ${
                selectedTabInnovation === "1"
                  ? "bg-yellow-500 text-black"
                  : "text-white"
              } `}
            >
              <h1
                className={`${
                  selectedTabInnovation === "1"
                    ? "bg-yellow-500 text-black"
                    : "text-black bg-white"
                } rounded-full px-3 py-1 w-10 h-10 text-center flex items-center justify-center text-[16px] 
              min-[2000px]:w-[54px] min-[2000px]:h-[54px] min-[2000px]:py-[20px] min-[2000px]:text-3xl font-karla font-normal leading-normal`}
              >
                1
              </h1>
              <span
                className={`font-Karla text-[16px] font-normal leading-normal min-[2000px]:text-3xl ${
                  selectedTabInnovation === "1"
                    ? "text-yellow-500"
                    : " text-white"
                }`}
              >
                I.P. Proof
              </span>
            </TabsTrigger>
          </div>
          <span className="w-[16px] h-[1px] min-[2000px]:w-[40px] bg-[#B2CBD3]" />

          <div className="flex items-center space-x-2">
            <TabsTrigger
              value="2"
              className={`px-4 py-2 space-x-2 min-[2000px]:space-x-4 ring-0 ${
                selectedTabInnovation === "2"
                  ? "bg-yellow-500 text-black"
                  : "text-white"
              } `}
            >
              <h1
                className={`${
                  selectedTabInnovation === "2"
                    ? "bg-yellow-500 text-black"
                    : "text-black bg-white"
                } rounded-full px-3 py-1 w-10 h-10 text-center flex items-center justify-center text-[16px] 
    min-[2000px]:w-[54px] min-[2000px]:h-[54px] min-[2000px]:py-[20px] min-[2000px]:text-3xl font-karla font-normal leading-normal`}
              >
                2
              </h1>
              <span
                className={`font-Karla text-[16px] font-normal leading-normal min-[2000px]:text-3xl ${
                  selectedTabInnovation === "2"
                    ? "text-yellow-500"
                    : " text-white"
                }`}
              >
                Details
              </span>
            </TabsTrigger>
          </div>
        </TabsList>

        <div className="flex h-screen justify-center min-[2000px]:w-[2560px]">
          <TabsContent value="1">

            <NFT />

          </TabsContent>
          <TabsContent value="2">
            <NFT2 />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Main Dashboard component that provides the context
export default function InnovationPage() {
  return <InovationContent />;
}

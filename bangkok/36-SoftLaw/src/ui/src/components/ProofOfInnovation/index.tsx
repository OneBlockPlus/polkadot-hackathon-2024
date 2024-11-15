"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IpRegistries from "./registry";
import Identity from "./identity";
import UniqueProvider from "@/context/unique";
import IpfsProvider from "@/context/innovation";
import LegalContracts from "./legalContracts";
// import NavBar from "@/components/NavBar";
import InnovationProvider, { useInnovationContext } from "@/context/innovation";
import NavBar from "../NavBar";


// Separate component for the dashboard content
function NFTContent() {
  const { selectedTabInnovation, setSelectedTabInnovation } = useInnovationContext();

  const [formData, setFormData] = useState({
    // IpProofData: {
    //   UploadFile: [],
    //   TypeOfIntellectualProperty: "",
    //   ReferenceNumber: "",
    //   ReferenceLink: "",
    // },
    IpProofData: {
      TypeOfPatent: "",
      PatentTitle: "",
      FillingDate: null,
      PatentNumber: "",
    },
    IpProofDetail: {
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
    <Tabs
      value={selectedTabInnovation}
      onValueChange={setSelectedTabInnovation}
      className="bg-[#1C1A11] pt-[120px]"
    >
      <TabsList className="flex items-center min-[2000px]:w-[3000px] bg-[#1C1A11]">
        {/* <div className="flex items-center space-x-2">
          <TabsTrigger
            value="1"
            className={`px-4 py-2 space-x-2 min-[2000px]:space-x-4 ring-0 ${
              selectedTabInnovation === "1"
                ? "bg-yellow-500 text-black"
                : "text-black"
            } `}
          >
            <h1
              className={`${
                selectedTabInnovation === "1"
                  ? "bg-yellow-500 text-black"
                  : "text-black bg-white"
              } rounded-full px-3 py-1 min-[2000px]:w-[54px] min-[2000px]:h-[54px] min-[2000px]:py-[20px] w-10 h-10 text-center flex items-center justify-center min-[2000px]:text-3xl text-sm`}
            >
              1
            </h1>
            <span
              className={`font-Karla text-[16px] font-normal leading-normal min-[2000px]:text-3xl  ${
                selectedTabInnovation === "1"
                  ? "text-yellow-500"
                  : " text-white"
              }`}
            >
              Selection
            </span>
          </TabsTrigger>
        </div> */}

        {/* <span className="w-[16px] h-[1px] bg-[#B2CBD3]" /> */}

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
              } rounded-full px-3 py-1 min-[2000px]:w-[54px] min-[2000px]:h-[54px] min-[2000px]:py-[20px] w-10 h-10 text-center flex items-center justify-center text-[16px] min-[2000px]:text-3xl 
                  font-karla font-normal leading-normal`}
            >
              1
            </h1>
            <span
              className={`font-Karla text-[16px] font-normal leading-normal min-[2000px]:text-3xl ${
                selectedTabInnovation === "2"
                  ? "text-yellow-500"
                  : " text-white"
              }`}
            >
              IP Data
            </span>
          </TabsTrigger>
        </div>

        <span className="w-[16px] h-[1px] min-[2000px]:w-[40px] bg-[#B2CBD3]" />

        <div className="flex items-center space-x-2">
          <TabsTrigger
            value="3"
            className={`px-4 py-2 space-x-2 min-[2000px]:space-x-4 ring-0 ${
              selectedTabInnovation === "3"
                ? "bg-yellow-500 text-black"
                : "text-white"
            } `}
          >
            <h1
              className={`${
                selectedTabInnovation === "3"
                  ? "bg-yellow-500 text-black"
                  : "text-black bg-white"
              } rounded-full px-3 py-1 w-10 h-10 text-center flex items-center justify-center text-[16px] 
              min-[2000px]:w-[54px] min-[2000px]:h-[54px] min-[2000px]:py-[20px] min-[2000px]:text-3xl font-karla font-normal leading-normal`}
            >
              2
            </h1>
            <span
              className={`font-Karla text-[16px] font-normal leading-normal min-[2000px]:text-3xl ${
                selectedTabInnovation === "3"
                  ? "text-yellow-500"
                  : " text-white"
              }`}
            >
              IP Detail
            </span>
          </TabsTrigger>
        </div>
      </TabsList>

      <div className="flex h-screen justify-center min-[2000px]:w-[2560px]">
        {/* <TabsContent value="1">
          <IpRegistries
            onDataChange={(data) => handleFormDataChange("IpRegistries", data)}
          />
        </TabsContent> */}
        <TabsContent value="2">
          <Identity
            // onDataChange={(data) => setFormData({ ...formData, Identity: data })}
          />
        </TabsContent>
        <TabsContent value="3">
          <LegalContracts
            onDataChange={(data) =>
              setFormData({ ...formData, IpProofDetail: data })
            }
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}

// Main Dashboard component that provides the context
export default function Dashboard() {
  return (
    <InnovationProvider>
      <IpfsProvider>
        <NavBar />
  
        <UniqueProvider>
          <NFTContent />
        </UniqueProvider>
      </IpfsProvider>
    </InnovationProvider>
  );
}

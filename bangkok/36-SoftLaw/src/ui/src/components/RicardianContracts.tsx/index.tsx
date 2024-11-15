"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import License from "./License";
import Manage from "./Manage";
import Pay from "./Pay";
import RicardianProvider, { useRicardianContext } from "@/context/ricardian";

export default function RicardianContracts() {
  const [tabsVisible, setTabsVisible] = useState(true);
  const { selectedTabRicardian, setSelectedTabRicardian } =
    useRicardianContext();
  const [activeTab, setActiveTab] = useState("collections");

  const handleTab = async () => {
    setTabsVisible(!tabsVisible);
  };

  const [formData, setFormData] = useState({
    IpRegistries: {
      UploadFile: [],
      TypeOfIntellectualProperty: "",
      ReferenceNumber: "",
      ReferenceLink: "",
    },
    Identity: {
      TypeOfPatent: "",
      PatentTitle: "",
      FillingDate: null,
      PatentNumber: "",
    },
    LegalContracts: {
      UploadFile: null,
      NFTName: "",
      Collection: "",
      TypesOfProtection: "",
      Description: "",
    },
  });

  // Collect data from child components
  const handleFormDataChange = (tab: string, data: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [tab]: data,
    }));
  };

  return (
    <RicardianProvider>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className=" bg-[#1C1A11] pt-[120px] scrollable"
      >
        {tabsVisible && (
          <TabsList className="flex items-center min-[2000px]:w-[2560px] bg-[#1C1A11]">
            <div className="flex items-center space-x-2">
              <TabsTrigger
                value="collections"
                className={`px-4 py-2 space-x-2 ring-0 ${
                  selectedTabRicardian === "collections"
                    ? "bg-yellow-500 text-black"
                    : "text-black"
                } `}
              >
               <h1
                  className={`${
                    activeTab === "collections"
                      ? "bg-yellow-500 text-black"
                      : "text-black bg-white"
                  } rounded-full px-3 py-1  w-auto h-auto text-center flex items-center justify-center text-[16px] 
                    min-[2000px]:w-[50px] min-[2000px]:h-[50px] min-[2000px]:py-[20px] min-[2000px]:text-3xl font-karla font-normal leading-normal`}
                >
                  License
                </h1>
              
              </TabsTrigger>
            </div>

            <span className="w-[16px] h-[1px]  bg-[#B2CBD3]" />

            <div className="flex items-center space-x-2 ">
              <TabsTrigger
                value="nfts"
                className={`px-4 py-2 space-x-2 ring-0 ${
                  selectedTabRicardian === "nfts"
                    ? "bg-yellow-500   text-black"
                    : "text-white"
                } `}
              >
               <h1
                  className={`${
                    activeTab === "nfts"
                      ? "bg-yellow-500 text-black"
                      : "text-black bg-white"
                  } rounded-full px-3 py-1  w-auto h-auto text-center flex items-center justify-center text-[16px] 
                    min-[2000px]:w-[50px] min-[2000px]:h-[50px] min-[2000px]:py-[20px] min-[2000px]:text-3xl font-karla font-normal leading-normal`}
                >
                  Pay
                </h1>
              </TabsTrigger>
            </div>
            <span className="w-[16px] h-[1px] min-[2000px]:w-[40px] bg-[#B2CBD3]" />

            <div className="flex items-center space-x-2">
              <TabsTrigger
                value="contracts"
                className={`px-4 py-2 space-x-2 ring-0 ${
                  activeTab === "contracts"
                    ? "bg-yellow-500   text-black"
                    : " text-white"
                } `}
              >
                <h1
                  className={`${
                    activeTab === "contracts"
                      ? "bg-yellow-500 text-black"
                      : "text-black bg-white"
                  } rounded-full px-3 py-1  w-auto h-auto text-center flex items-center justify-center text-[16px] 
                    min-[2000px]:w-[50px] min-[2000px]:h-[50px] min-[2000px]:py-[20px] min-[2000px]:text-3xl font-karla font-normal leading-normal`}
                >
                  Manage
                </h1>
              </TabsTrigger>
            </div>
          </TabsList>
        )}
        <div className="flex h-screen min-[2000px]:w-[2560px]">
          <TabsContent value="collections">
            {/* <License
              onDataChange={(data) =>
                handleFormDataChange("IpRegistries", data)
              }
            /> */}
          </TabsContent>
          <TabsContent value="nfts">
            <Pay
              onDataChange={(data) =>
                setFormData({ ...formData, Identity: data })
              }
            />
          </TabsContent>
          <TabsContent value="contracts">
            <Manage
              onDataChange={(data) =>
                setFormData({ ...formData, LegalContracts: data })
              }
            />
          </TabsContent>
        </div>
      </Tabs>
    </RicardianProvider>
  );
}

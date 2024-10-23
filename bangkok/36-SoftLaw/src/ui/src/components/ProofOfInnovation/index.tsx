"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IpRegistries from "./registry";
import Identity from "./identity";
import UniqueProvider from "@/context/unique";
import IpfsProvider from "@/context/ipfs";
import LegalContracts from "./legalContracts";
import DashboardProvider, { useDashboardTapContext } from "@/context/tab";

export default function Dashboard() {
  const [tabsVisible, setTabsVisible] = useState(true);
  const {selectedTabDashboard,
    setSelectedTabDashboard,} = useDashboardTapContext()
  const [activeTab, setActiveTab] = useState("collections");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTab = async () => {
    setTabsVisible(!tabsVisible);
  };
 
  const [formData, setFormData] = useState({
    IpRegistries: {
      UploadFile: [],
      TypeOfIntellectualProperty: '',
      ReferenceNumber: '',
      ReferenceLink: '',
    },
    Identity: {
      TypeOfPatent: '',
      PatentTitle: '',
      FillingDate: null,
      PatentNumber: '',
    },
    LegalContracts: {
      UploadFile: null,
      NFTName: '',
      Collection: '',
      TypesOfProtection: '',
      Description: '',
    },
  })



 // Collect data from child components
 const handleFormDataChange = (tab: string, data: any) => {
  setFormData((prevData) => ({
    ...prevData,
    [tab]: data,
  }));
};

  return (
    <IpfsProvider >
      <UniqueProvider>
        <DashboardProvider>
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
                    selectedTabDashboard === "collections"
                      ? "bg-yellow-500 text-black"
                      : "text-black"
                  } `}
                >
                  <h1
                    className={`${
                      activeTab === "collections"
                        ? "bg-yellow-500 text-black"
                        : "text-black bg-white"
                    } rounded-full px-3 py-1 min-[2000px]:w-20 min-[2000px]:h-20 w-10 h-10 text-center flex items-center justify-center text-sm`}
                  >
                    1
                  </h1>
                  <span
                    className={`font-Karla text-[16px] font-normal leading-normal min-[2000px]:text-3xl  ${
                      activeTab === "collections"
                        ? "text-yellow-500"
                        : " text-white"
                    }`}
                  >
                    Selection
                  </span>
                 
                </TabsTrigger>
              </div>

              <span className="w-[16px] h-[1px]  bg-[#B2CBD3]" />

              <div className="flex items-center space-x-2 ">
                <TabsTrigger
                  value="nfts"
                  className={`px-4 py-2 space-x-2 ring-0 ${
                    activeTab === "nfts"
                      ? "bg-yellow-500   text-black"
                      : "text-white"
                  } `}
                >
                  <h1
                    className={`${
                      activeTab === "nfts"
                        ? "bg-yellow-500 text-black"
                        : "text-black bg-white"
                    } rounded-full px-3 py-1 w-10 h-10 text-center flex items-center justify-center text-[16px] 
                        font-karla font-normal leading-normal`}
                  >
                    2
                  </h1>
                 
                  <span
                    className={`font-Karla text-[16px] font-normal leading-normal min-[2000px]:text-3xl ${
                      activeTab === "nfts" ? "text-yellow-500" : " text-white"
                    }`}
                  >
                    IP Data
                  </span>
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
                    } rounded-full px-3 py-1  w-10 h-10 text-center flex items-center justify-center text-[16px] 
                    min-[2000px]:w-[50px] min-[2000px]:h-[50px] min-[2000px]:py-[20px] min-[2000px]:text-3xl font-karla font-normal leading-normal`}
                  >
                    3
                  </h1>
                  <span
                    className={`font-Karla text-[16px] font-normal leading-normal min-[2000px]:text-3xl ${
                      activeTab === "contracts"
                        ? "text-yellow-500"
                        : " text-white"
                    }`}
                  >
                    NFT Detail
                  </span>
                </TabsTrigger>
              </div>
            </TabsList>
          )}
          <div className="flex h-screen min-[2000px]:w-[2560px]">
            <TabsContent value="collections">
              <IpRegistries onDataChange={(data) => handleFormDataChange('IpRegistries', data) } />
            </TabsContent>
            <TabsContent value="nfts">
              <Identity onDataChange={(data) => setFormData({ ...formData, Identity: data })}/>
            </TabsContent>
            <TabsContent value="contracts">
              <LegalContracts onDataChange={(data) => setFormData({ ...formData, LegalContracts: data })}  />
            </TabsContent>
          </div>
        </Tabs>
        </DashboardProvider>
      </UniqueProvider>
    </IpfsProvider>
  );
}

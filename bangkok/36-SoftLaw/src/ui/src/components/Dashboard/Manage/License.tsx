"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LicenseCreationFlow } from "./LicenseCreation/LicenseFlowCreation";
import type { LicenseFormData } from "./LicenseCreation/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TypesComponent from "@/components/TypesProps";
import { getSoftlawApi } from "@/utils/softlaw/getApi";
import OfferLicenseButton from "./ActionButtons/license/OfferLicenseButton";
import InnovationProvider from "@/context/innovation";
import AccountsProvider from "@/context/account";

interface ManageProps {
  onDataChange?: (data: any) => void;
}
interface License extends LicenseFormData {
  status: string;
  lifetimeEarnings: string;
  recentPayment: string;
  amount: string;
}

// Componente que maneja los parámetros de búsqueda
function SearchParamsHandler({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  // Aquí puedes manejar la lógica relacionada con searchParams
  return <>{children}</>;
}

function LicensingContent({ onDataChange }: ManageProps) {
  // Get URL parameters
  const searchParams = useSearchParams();
  const [showLicenseCreation, setShowLicenseCreation] = useState(true);
  const [licenses, setLicenses] = React.useState<License[]>([]);
  const handleLicenseCreation = (data: LicenseFormData) => {
    // Adds the new license to the list
    setLicenses((prev) => [
      ...prev,
      {
        id: Date.now(), 
        ...data,
        status: "Active",
        lifetimeEarnings: "$2.45",
        recentPayment: "Oct. 24",
        amount: "unknown",
      } as License,
    ]);
    setShowLicenseCreation(false);
  };



  const licenseOffer = async () => {
    let api = await getSoftlawApi();

    let tx = api.tx.ipPallet;

    console.log(tx)
  }
  return (
    <div className="bg-[#1C1A11] w-full justify-center self-stretch items-center min-[2000px]:min-h-screen min-[2000px]:w-[3000px] py-[120px] mx-auto scrollable">
      {showLicenseCreation ? (
        <LicenseCreationFlow
          onComplete={handleLicenseCreation}
          onCancel={() => setShowLicenseCreation(false)}
        />
      ) : (
        <div className="self-stretch flex flex-col items-end gap-[16px] w-full">
          {licenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-center text-gray-400">
                No licenses created yet.
              </p>
              <Button
                onClick={() => setShowLicenseCreation(true)}
                className="bg-[#373737] text-white hover:bg-[#FACC15] hover:text-[#1C1A11] px-4 py-2 rounded"
              >
                Create New License
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-8 gap-[10px] pb-2 items-start border-b-[#ffff] mx-auto">
                <TypesComponent
                  text="NFT ID"
                  className="text-[#B0B0B1] min-[2000px]:text-2xl text-[16px]"
                />
                <TypesComponent
                  text="License Type"
                  className="text-[#B0B0B1] min-[2000px]:text-2xl text-[16px]"
                />
                <TypesComponent
                  text="Status"
                  className="text-[#B0B0B1] min-[2000px]:text-2xl text-[16px]"
                />
                <TypesComponent
                  text="License Price"
                  className="text-[#B0B0B1] min-[2000px]:text-2xl text-[16px]"
                />
                <TypesComponent
                  text="Royalty Rate"
                  className="text-[#B0B0B1] min-[2000px]:text-2xl text-[16px]"
                />
                <TypesComponent
                  text="Duration Type"
                  className="text-[#B0B0B1] min-[2000px]:text-2xl text-[16px]"
                />
                <TypesComponent
                  text="Payment Type"
                  className="text-[#B0B0B1] min-[2000px]:text-2xl text-[16px]"
                />
              </div>
              <div className="flex flex-col pb-[16px]   p-4 bg-[#1C1A11] mx-auto">
                {licenses.map((license: License) => (
                  <Card
                    key={license.nftId}
                    className="bg-[transparent] border-none"
                  >
                    <div className="grid grid-cols-8 gap-[40px] pb-2 items-start">
                      <TypesComponent
                        className="font-bold min-[2000px]:text-2xl text-[#fff] "
                        text={`${license.nftId}`}
                      />

                      <TypesComponent
                        className="text-[#fff]"
                        text={` ${license.licenseType}`}
                      />

                      <div className="bg-[#43C705] rounded-[36px] flex py-1 px-4 items-center justify-center text-black md:w-[70px] min-[2000px]:w-full min-[2000px]:text-2xl">
                        <TypesComponent
                          className="text-black"
                          text={`Active`}
                        />
                      </div>

                      <div>
                        <TypesComponent
                          className="px-2 py-1 text-[#fff] min-[2000px]:text-2xl text-sm"
                          text={`${license.price.amount} ${license.price.currency}`}
                        />
                      
                      </div>

                      <div className="text-[#fff]">{`${license.royaltyrate}%`}</div>

                      <TypesComponent
                        className="text-center min-[2000px]:text-2xl text-[#fff]"
                        text={` ${license.durationType}`}
                      />

                      <TypesComponent
                        className="text-center min-[2000px]:text-2xl text-[#fff]"
                        text={`${license.paymentType}`}
                      />
                    </div>
                  </Card>
                ))}

            <div className="flex items-center justify-end text-center gap-4">
                  <Button
                    onClick={() => setShowLicenseCreation(true)}
                    className="bg-[#373737] text-white hover:bg-[#FACC15] hover:text-[#1C1A11] px-4 py-2 rounded"
                  >
                    Renew License
                  </Button>
                  <Button
                    onClick={() => setShowLicenseCreation(true)}
                    className="bg-[#373737] text-white hover:bg-[#FACC15] hover:text-[#1C1A11] px-4 py-2 rounded"
                  >
                    Request Payment
                  </Button>
                  <Button
                    onClick={() => setShowLicenseCreation(true)}
                    className="bg-[#373737] text-white hover:bg-[#FACC15] hover:text-[#1C1A11] px-4 py-2 rounded"
                  >
                    Edit Royalty Rate
                  </Button>

                  {/* <button onClick={licenseOffer}>
                    Create License
                  </button> */}
                  <OfferLicenseButton/>
                </div>
              </div>
              
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Licensing(props: ManageProps) {
  return (
  

       <Suspense fallback={<div className="bg-[#1C1A11] w-full h-screen flex items-center justify-center">
      <p className="text-white">Cargando...</p>
    </div>}>
      <SearchParamsHandler>
        <LicensingContent {...props} />
      </SearchParamsHandler>
    </Suspense>

   
  );
}
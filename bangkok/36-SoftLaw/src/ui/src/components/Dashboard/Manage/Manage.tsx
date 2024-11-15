"use client";
import React, { useEffect, useState } from "react";
import { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LicenseFormData } from '@/components/Dashboard/Manage/LicenseCreation/types';
import { FormDataContext } from "@/components/FormDataContext";
import { useDashboardContext } from "@/context/dashboard";
import TypesComponent from "@/components/TypesProps";


interface ManageProps {
  onDataChange: (data: any) => void;
  formData: LicenseFormData;
}


export default function Manage() {


  const [showLicenseCreation, setShowLicenseCreation] = useState(false);
  const [licenses, setLicenses] = React.useState<LicenseFormData[]>([]);

  const { selectedTabDashboard,
    setSelectedTabDashboard } =
    useDashboardContext();

  const { updateFormData } = useContext(FormDataContext);

  return (
    <div className="bg-[#1C1A11] flex flex-col w-full justify-center self-stretch items-center min-[2000px]:min-h-screen min-[2000px]:w-[3000px] gap-[40px] pt-[40px] pb-[120px]">
        {/* Important Updates Section */}
        <div className="space-y-4 bg-[#27251C] rounded-[16px] flex flex-col gap-[40px] self-stretch p-[16px] w-full mx-auto md:max-w-screen-xl min-[2000px]:w-[3000px]">
          <TypesComponent 
          className="text-[#fff]"
          text = "Important Updates"
          detail=" - Keep Track of all Your IP Activity"
          />
          {licenses.length > 0 && (
            <div className="flex flex-col p-[16px] items-start gap-[16px] border-b-[#8A8A8A] min-[2000px]:w-[3000px] w-full">
              {licenses.map((license) => (
                <div key={license.nftId} className="bg-[#373737] p-4 gap-[16px] flex justify-between items-start">
                  <Image 
                  src={"/images/Link.svg"}
                  width={64}
                  height={64}
                  alt="Link"
                  />
                  <div className="flex flex-col gap-[8px]">
                  {/* <h1 className="text-[16px] font-normal leading-[145%] tracking-[0.32px] text-[#ffff]">The license for <span className="font-bold text-[#43C705]">'Method and Formulation For Gluten-Free Bakery Products'</span>  Patent expires in 15 days. Renew now to avoid disruptions.</h1> */}
                    <TypesComponent className="text-[16px] min-[2000px]:text-2xl font-normal leading-[145%] tracking-[0.32px] text-[#ffff]"
                    text={`The license for NFT ID: ${license.nftId} has been created successfully.`}
                    />
                    <div className="flex items-center justify-end gap-[40px]">
                      <div className="flex items-start flex-end ">
                      <h1 className="flex items-start flex-end  text-[#8A8A8A]">10 minutes ago (time)</h1>
                      </div>
                    
                    <div className="flex justify-end items-end">
                    <Button className="py-[8px] px-[16px] flex bg-transparent">Cancel</Button>
                    <Button className="py-[8px] px-[16px] flex rounded-[8px] bg-[#373737]">Accept</Button>
                    </div>
                    </div>
                  </div>
              </div>
              ))}
            </div>
          )}
          {licenses.length > 0 && (
            <div className="flex flex-col p-[16px] items-start gap-[16px] border-b-[#8A8A8A] min-[2000px]:w-[3000px] w-full">
              {licenses.map((license) => (
                <div key={license.nftId} className="bg-[#373737] p-4 gap-[16px] flex justify-between items-start">
                  <Image 
                  src={"/images/Link.svg"}
                  width={64}
                  height={64}
                  alt="Link"
                  />
                  <div className="flex flex-col gap-[8px]">
                  <h1 className="text-[16px] font-normal leading-[145%] tracking-[0.32px] text-[#ffff]">The license for
                    {license.licenseType}
                     <span className="font-bold text-[#43C705]">  'Method and Formulation For Gluten-Free Bakery Products'</span>  Patent expires in 15 days. Renew now to avoid disruptions.</h1>
                    <div className="flex items-center justify-end gap-[40px]">
                      <div className="flex items-start flex-end ">
                      <h1 className="flex items-start flex-end  text-[#8A8A8A]">10 minutes ago (time)</h1>
                      </div>
                    <div className="flex justify-end items-end">
                    <Button className="py-[8px] px-[16px] flex bg-transparent">Cancel</Button>
                    <Button className="py-[8px] px-[16px] flex rounded-[8px] bg-[#373737]">Accept</Button>
                    </div>
                    </div>
                  </div>
              </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col w-full md:w-[1000px] gap-[40px] self-stretch items-center p-[16px] border border-[#8A8A8A] rounded-[16px]">
          <div className="flex justify-between items-start self-stretch mb-[60px]">
            <TypesComponent 
            className="text-[#EFF4F6]"
            text="Licence payment" />
            <Link
            href={"/licensing"}
            >
              <Button
              onClick={() => setShowLicenseCreation(true)}
              className="bg-[#373737] min-[2000px]:text-2xl text-[#fff] hover:bg-[#FACC15]  hover:text-[#1C1A11]"
            >
              Create License
            </Button>
            </Link>
          </div>
        </div>
    </div>
  );
}

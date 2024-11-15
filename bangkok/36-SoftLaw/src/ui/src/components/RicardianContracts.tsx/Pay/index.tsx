"use client";
import MaxWidthWrapper from "@/components/MaxWidhWrapper";
import ReusableHeading from "../textComponent";
import TypesComponent from "../TypesProps";
import InputField from "../input";
import Link from "next/link";
import Footer from "@/components/Footer";
import React, { useEffect, useState } from "react";
import VariousTypesButton from "../VariousTypesButton";
import { useContext } from 'react';
import { FormDataContext } from "../FormDataContext";


interface PayProps {
  onDataChange?: (data: any) => void;
}

export default function Pay({onDataChange}: PayProps) {
  const {formData, updateFormData} = useContext(FormDataContext);

  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
    updateFormData("Identity", { TypeOfPatent: buttonName })
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('Identity', { PatentTitle: e.target.value });
    
  };

  const handlePatentNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('Identity', { PatentNumber: e.target.value });
   
  };

  const handleFillingDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = new Date(e.target.value);
    updateFormData('Identity', { FillingDate: dateValue });
  };

  const callOnDataChange = () => {
    onDataChange && onDataChange(formData);
  };

  useEffect(() => {
    callOnDataChange();
  }, [formData, onDataChange]);
  
  return (
    <>
      <div className="bg-[#1C1A11] flex flex-col w-full justify-center items-center text-white pb-[60px] min-[2000px]:w-[2560px] ">
        <MaxWidthWrapper className="flex flex-col self-stretch min-[2000px]:min-h-screen pt-[120px] justify-center items-center">
          <div className="flex flex-col w-full justify-items-center gap-[60px] pb-[120px]">
            <div>
              <ReusableHeading
                text="Pay"
                detail="Please Fill in the Matching Patent Details"
                className="text-[#8A8A8A]"
              />
            </div>

            <div className="flex flex-col items-start self-stretch gap-[16px] w-full">
              <TypesComponent text="Types of Patent" />
              <div className="flex items-start space-x-4 self-stretch">
                <VariousTypesButton
                  isActive={activeButton === "Utility Patent"}
                  className={`min-[2000px]:w-[px] w-full h-[auto] ${
                    activeButton === "Utility Patent"
                      ? "border-[#FACC15] bg-[#373737]"
                      : "border-[#8A8A8A]"
                  } text-[#D0DFE4] hover:border-[#FACC15] hover:bg-[#373737]`}
                  width="full"
                  text="Utility Patent"
                  detail="Protects new inventions or functional improvements to existing products, processes, or machines. This is the most common type of patent, covering how an invention works."
                  onClick={() => {
                    handleButtonClick("Utility Patent");
                  }}
                />

                <VariousTypesButton
                  isActive={activeButton === "Design Patent"}
                  className={`min-[2000px]:w-[px] w-full h-[auto] ${
                    activeButton === "Design Patent"
                      ? "border-[#FACC15] bg-[#373737]"
                      : "border-[#8A8A8A]"
                  } text-[#D0DFE4] hover:border-[#FACC15] hover:bg-[#373737]`}
                  width="full"
                  text="Design Patent"
                  detail="Protects the unique appearance or ornamental design of a product rather than its function. 

                For example, the shape of a car or the design of a smartphone."
                  onClick={() => {
                    handleButtonClick("Design Patent");
                  }}
                />

                <VariousTypesButton
                  isActive={activeButton === "Provisional Patent"}
                  className={`min-[2000px]:w-[px] w-full h-[auto] ${
                    activeButton === "Provisional Patent"
                      ? "border-[#FACC15] bg-[#373737]"
                      : "border-[#8A8A8A]"
                  } text-[#D0DFE4] hover:border-[#FACC15] hover:bg-[#373737]`}
                  width="full"
                  text="Provisional Patent"
                  detail="A temporary application that gives you an early filing date and up to 12 months to file a full utility patent. This option is useful if your invention is still in development."
                  onClick={() => {
                    handleButtonClick("Provisional Patent");
                  }}
                />
                <VariousTypesButton
                  isActive={activeButton === "Plant Patent"}
                  className={`min-[2000px]:w-[px] w-full h-[auto] ${
                    activeButton === "Plant Patent"
                      ? "border-[#FACC15] bg-[#373737]"
                      : "border-[#8A8A8A]"
                  } text-[#D0DFE4] hover:border-[#FACC15] hover:bg-[#373737]`}
                  width="full"
                  text="Plant Patent"
                  detail="Granted for the invention or discovery of a new and distinct plant variety, reproduced through asexual means like grafting or cutting, rather than seeds."
                  onClick={() => {
                    handleButtonClick("Plant Patent");
                  }}
                />
              </div>
            </div>

            <form action="" className="flex flex-col gap-[60px]">
              <div className="flex flex-col items-start self-stretch gap-[8px]">

                <InputField
                label= "Patent Title"
                value={formData.Identity.PatentTitle}
                type="text"
                  hasDropdown={false}
                  className="min-[2000px]:w-[px] min-w-[280px]"
                  onChange={handleInputChange}
                />
              </div>

              
                <div className="flex items-start gap-[60px]">
                  <div className="flex flex-col items-start gap-[6px]">
                   
                    <InputField
                    type={"number"}
                    label= "Patent Number"
                    value={formData.Identity.PatentNumber}
                    onChange={handlePatentNumber}
                      hasDropdown={true}
                      className=" min-w-[280px] w-full"
                    />

                    <TypesComponent
                      className="text-[#8A8A8A] "
                      text={`A unique identifier issued once your patent is officially approved and published to track and reference your patent in legal. ${(
                        <br />
                      )} Example: US1234567B1.`}
                    />
                  </div>
                    <InputField
                    label= "Filling Date"
                    value={formData.Identity.FillingDate ? formData.Identity.FillingDate.toISOString().substring(0, 10) : ''}
                    hasDropdown={true}
                    onChange={handleFillingDate}
                    type="Date"
                      className=" w-[280px]"
                    />         
                </div> 
            </form>

            <div className="flex items-start justify-between w-full ">
              <Link
                href="/dashboard"
                className="bg-transparent rounded-[16px] px-[20px] py-[8px] w-[128px] items-center text-center min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl min-[2000px]:w-[200px]flex-shrink-0 border border-[#D0DFE4] text-[#D0DFE4] hover:bg-[#FACC15]  hover:text-[#1C1A11] hover:border-none"
                children="Back"
              />
              <Link
                href="/LegalContracts"
                className="bg-[#D0DFE4] min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl w-[128px] min-[2000px]:w-[200px] items-center text-center rounded-[16px] text-[#1C1A11] px-[22px] py-[8px] flex-shrink-0 hover:bg-[#FACC15]"
                children="Next"
              />
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
      <Footer
        width="py-[60px] min-[2000px]:py-[70px] max-h-[400px]"
        className="border-t-[1px] border-[#8A8A8A] w-full"
      />
    </>
  );
}

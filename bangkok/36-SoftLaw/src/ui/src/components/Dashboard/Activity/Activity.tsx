"use client";
import React, { useEffect, useState } from "react";
import MaxWidthWrapper from "@/components/MaxWidhWrapper";
import { useContext } from "react";
// import { FormDataContext } from "../../ProofOfInnovation/FormDataContext";
// import { useDashboardTapContext } from "@/context/dashboard";
import Footer from "../../Footer";
import Searchfilter from "../Searchfilter";
// import TypesComponent from "../../ProofOfInnovation/TypesProps";
import { FormDataContext } from "@/components/FormDataContext";
import TypesComponent from "@/components/TypesProps";
import { useDashboardContext } from "@/context/dashboard";

interface ActivityProps {
  onDataChange: (data: any) => void;
}


export default function Activity({ onDataChange }: ActivityProps) {
  const { selectedTabDashboard, setSelectedTabDashboard } =
    useDashboardContext()

  const { formData, updateFormData } = useContext(FormDataContext);

  return (
    <div className="bg-[#1C1A11] flex flex-col flex-shrink-0 w-full justify-center items-center text-white min-[2000px]:w-[3000px]">
      <MaxWidthWrapper className="flex flex-col self-stretch min-[2000px]:min-h-screen pt-[120px] justify-center items-center">
        <div className="w-full flex flex-col">
          <div className="flex gap-[50px] w-full justify-between font-bold text-white min-[2000px]:w-[2560px] border-b border-[#8A8A8A] pb-[16px]">
            <TypesComponent text="Trademark Overview" />
            <TypesComponent text="Owner" className="" />
            <TypesComponent text="Serial Number" />
            <TypesComponent text="Status" />
            <TypesComponent text="Price" />
          </div>
          <Searchfilter />
          <Searchfilter />
        </div>
      </MaxWidthWrapper>
      <Footer
        width="py-[60px] max-h-[400px]"
        className="border-t-[1px] border-[#8A8A8A] w-full"
      />
    </div>
  );
}

import React from "react";
import MaxWidthWrapper from "@/components/MaxWidhWrapper";
import ProofOwnership from "./IpTokenixer";

function OurProducts() {
  return (
    <section className="self-stretch bg-[#1C1A11] flex flex-col min-h-[800px] pt-[120px] pb-[240px] justify-center items-center gap-[60px]">
      <MaxWidthWrapper className="p-[25px] items-start gap-[60px]">
        <h1 className="text-[48px] font-Montesarrat font-bold leading-[110%] tracking-[-0.9px] uppercase text-[#EFF4F6] pb-[40px]">
          OUR PRODUCTS
        </h1>

        <div className="border-b border-[#B2CBD3] my-[60px]" />
        {/* Proof of ownership */}
        <ProofOwnership />

      </MaxWidthWrapper>
    </section>
  );
}

export default OurProducts;

"use client";
import React from "react";
import MaxWidthWrapper from "@/components/MaxWidhWrapper";
import CardServices from "./services";

function OurServices() {
  return (
    <div className="flex flex-col min-h-[800px] pt-[60px] min-[2000px]:pb-[5px] justify-center items-center gap-[60px] self-stretch bg-[#1C1A11] text-center text-white ">
      <MaxWidthWrapper className="flex flex-col w-full min-[2000px]:w-[2500px] max-w-[1280px] justify-center items-start self-stretch gap-[120px]">
        <div className="flex flex-col max-w-[1280px] justify-center items-center mx-auto gap-[60px] self-stretch">
          <h1 className="self-stretch font-Montesarrat text-[#D0DFE4] text-center text-[40px] font-bold leading-[110%] tracking-[-0.96px] min-[2000px]:text-6xl ">
            EMPOWER LEGAL ADVANCEMENT <br />
            IN THE DIGITAL ERA WITH EMERGING TECH
            <p className="text-[16px] font-[400] text-[#EFF4F6] leading-[140%] tracking-[0.32px] text-center pt-[16px]   min-[2000px]:text-4xl">
              Economic Resilience: In countries facing economic challenges,
              Motoverse empowers people to purchase and sell assets using
              cryptocurrency, providing a stable alternative to local currencies
              and fostering financial inclusion.
            </p>
          </h1>
        </div>

        <div className="flex self-stretch justify-between items-center flex-col md:flex-row lg:items-stretch md:gap-[auto] font-Montesarrat gap-[60px] min-[2000px]:gap-[70px]">
          <CardServices
            imageUrl="/images/scales.svg"
            altText="Scales icon"
            title={
              <>
                SMART LEGAL
                <br />
                CONTRACT
              </>
            }
            boxShadow="40px -40px 7px 0px rgba(250, 204, 21, 0.07), 20px -20px 13.7px 0px rgba(93, 76, 7, 0.67), 0px 0px 12px 7px var(--SL-yellow200, #F6E18B) inset"
          />
          <CardServices
            imageUrl="/images/Planet.svg"
            altText="Scales icon"
            title={
              <>
                REAL WORLD
                <br />
                LEGAL TOKENIZATION
              </>
            }
            boxShadow="0px -40px 7px 0px rgba(250, 204, 21, 0.07), 0px -20px 13.7px 0px rgba(93, 76, 7, 0.67), 0px 0px 12px 7px var(--SL-yellow200, #F6E18B) inset"
          />
          <CardServices
            imageUrl="/images/CubeTransparent.svg"
            altText="Scales icon"
            title={
              <>
                LEGAL CHAIN
                <br />
                DEVELOPMENT
              </>
            }
            boxShadow="-40px -40px 7px 0px rgba(250, 204, 21, 0.07), -20px -20px 13.7px 0px rgba(92, 75, 9, 0.67), 0px 0px 12px 7px var(--SL-yellow200, #F6E18B) inset"
          />
        </div>
      </MaxWidthWrapper>
    </div>
  );
}

export default OurServices;

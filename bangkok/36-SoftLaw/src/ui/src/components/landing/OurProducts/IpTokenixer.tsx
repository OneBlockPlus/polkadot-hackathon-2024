"use client";
import React from "react";
import { Button } from "@/components/ui/button";

function ProofOwnership() {
    return (
        <section className="w-full block md:flex justify-start items-start gap-[60px]  self-stretch">
        
        <div className="block md:flex min-[2000px]:max-w-[2560px] md:max-w-[1280px] justify-center items-center self-stretch gap-[50px]">
          <div className="flex flex-col items-start justify-between w-full gap-[40px]">
            <div className="font-Montesarrat flex flex-col items-start gap-[16px] self-stretch text-[#D0DFE4]">
              <h1 className="text-[48px] font-normal leading-[110%] tracking-[-0.96px]">IP Tokenizer Tool </h1>
              <h1 className="text-[28px] font-normal leading-[32px] tracking-[-0.56px] text-[#EFF4F6] uppercase  min-[2000px]:text-3xl min-[2000px]:tracking-[1px]">Proof of Innovation and Licensing Management.</h1>
              <p className="text-[20px] leading-[28px] min-[2000px]:text-2xl w-full min-[2000px]:tracking-[1px]">Introducing the Intellectual Property Chain secured by  <span className="text-[#FACC15]"> Polkadot Network </span>. This advanced solution enhances IP management with state-of-the-art technology, paving the way for a new era in legal industry digitization. </p>
            </div>
            
            <Button bgColor="bg-[#D0DFE4]" className="bg-[#D0DFE4] rounded-2xl hover:bg-yellow-400 text-[#1C1A11] text-[16px] font-Montesarrat leading-[145%] tracking-[0.32px] font-bold py-2 px-4 transition-colors duration-300 ease-in-out min-[2000px]:text-2xl">
            Create Proof of Ownership

              </Button>
          </div>
          <img className="pt-5 md:pt-0 min-[2000px]:w-[500px]  min-[2000px]:h-[500px] w-[350px] h-[350px]" src="/images/ip_.svg" alt="" />
        </div>

        
      </section>
    )
}

export default ProofOwnership;
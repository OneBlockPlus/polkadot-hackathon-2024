"use client";
import React from "react";
import  {Button}  from "@/components/ui/button";
import Link from "next/link";

function ProofOwnership() {
    return (
        <section className="w-full  justify-start  flex flex-col  items-start gap-[40px]  self-stretch">
        

        <img className="" src="/images/intelliTokenLayer.svg" alt="" />
        <div className="block min-[2000px]:max-w-[2560px] md:max-w-[1280px] justify-center items-center self-stretch gap-[50px]">

    


          <div className="flex flex-col items-start justify-between w-full gap-[40px]">

            <div className="font-Montesarrat flex flex-col items-start gap-[16px] self-stretch text-[#D0DFE4]">
              <div className="flex justify-between w-full items-end">
              <h1 className="text-[48px] font-normal leading-[110%] tracking-[-0.96px]">InnovaToken </h1>
              <div>
              <Link 
              href=""
            className="bg-[#D0DFE4] rounded-2xl hover:bg-yellow-400 text-[#1C1A11] text-[16px] w-full min-[2000px]:w-full font-Montesarrat leading-[145%] tracking-[0.32px] font-bold py-2 px-4 transition-colors duration-300 ease-in-out min-[2000px]:text-2xl"
            >
              Launch App
            </Link>

              </div>
              
              </div>
              <h1 className="text-[28px] font-normal leading-[32px] tracking-[-0.56px] text-[#EFF4F6] uppercase  min-[2000px]:text-3xl min-[2000px]:tracking-[1px]">Proof of Ownership for your creation on an NFT</h1>
              <p className="text-[20px] leading-[28px] min-[2000px]:text-2xl w-full min-[2000px]:tracking-[1px]">Introducing the Intellectual Property Tokenizer Tool and <span className="text-[#FACC15]"> Licensing Manager </span>. This advanced solution enhances IP management with state-of-the-art technology, paving the way for a new era in legal services. </p>
            </div>
            

            <div className="flex items-center gap-[24px]">
            <Button 
            // cta="Intellectual Property Tokenizer" 
            // Style="bg-[#373737] rounded-2xl hover:bg-yellow-400 text-[#1C1A11] text-[16px] w-full min-[2000px]:w-full font-Montesarrat leading-[145%] tracking-[0.32px] font-bold py-2 px-4 transition-colors duration-300 ease-in-out min-[2000px]:text-2xl"
            // purpose="submit"
            />
            <Button 
            // cta="IP Token Search" 
            // Style="bg-[#373737] rounded-2xl hover:bg-yellow-400 text-[#1C1A11] text-[16px] w-full min-[2000px]:w-full font-Montesarrat leading-[145%] tracking-[0.32px] font-bold py-2 px-4 transition-colors duration-300 ease-in-out min-[2000px]:text-2xl"
            // purpose="submit"
            />
            </div>
          
            

           
          </div>
         
        </div>
      </section>
    )
}

export default ProofOwnership;
import React from "react";
import MaxWidthWrapper from "../MaxWidhWrapper";


function UseCase(){
    return(
        
      <div className="flex min-h-[800px] py-[60px] min-[2000px]:py-[50px] flex-col justify-center items-center gap-[60px] self-stretch  "
      style={{
        background: "radial-gradient(173.44% 173.44% at 50% -37.69%, #1C1A11 49.54%, rgba(0, 0, 0, 0) 87.16%), url(/images/UseCaseBg.svg) no-repeat center center / cover",

      }}
      >
      
        <MaxWidthWrapper className="block md:flex items-start self-stretch min-[2000px]:gap-[150px] gap-[40px] ">

            <div className="self-stretch flex flex-col items-start gap-[16px] w-full md:w-[736px] font-Montesarrat text-[#EFF4F6] ">
              <h1 className="font-bold uppercase leading-[110%] tracking-[-0.96px] text-[48px]">LEGAL & BLOCKCHAIN USE CASES</h1>
              <p className="min-[2000px]:text-3xl">In collaboration with <span className="text-[#FACC15] text-[20px] min-[2000px]:text-3xl  font-normal leading-[28px] ">Unique Network</span>  we create the Intellectual Property Tokenizer Tool. </p>
            </div>

            <ul className="flex flex-col justify-center items-start min-[2000px]:gap-[20px] gap-[16px] font-Montesarrat text-[28px] uppercase font-[500] min-[2000px]:text-3xl leading-[32px] tracking-[-0.56px] text-[#EFF4F6] w-full md:w-[544px]">
              <li className="border-b  border-[#B2CBD3]">Intellectual Property</li>
              <li className="border-b border-[#B2CBD3]">Real Estate</li>
              <li className="border-b border-[#B2CBD3]">Vehicles</li>
              <li className="border-b border-[#B2CBD3]">Identities</li>
              <li className="border-b border-[#B2CBD3]">DAOS</li>
              <li className="border-b border-[#B2CBD3]">Proof of Legal</li>
            </ul>
        </MaxWidthWrapper>
  </div>
    )
}

export default UseCase;
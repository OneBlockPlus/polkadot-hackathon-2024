import React from "react";
import Teamcard from "./TeamCard";

function Team() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[800px] self-stretch bg-[#1C1A11] pt-[60.01px] pb-[48px] min-[2000px]:px-[320px]">
      <div className="flex flex-col w-full px-[150px] md:h-[304px] items-center gap-[40px]">
        <h1 className="self-stretch text-[#EFF4F6] font-Montesarrat text-[48px] font-[500] leading-[110%] tracking-[-0.96px]">
          TEAM
        </h1>

        <div className="flex flex-row items-start content-start gap-[16px] self-stretch flex-wrap">
          <div className="flex ">
            <Teamcard name="Mario" role="Founder"  />
            <Teamcard name="Luke" role="Tech Director & Polkadot Dev" />
            <Teamcard name="Favour" role="Front-End Dev" />
          </div>

          <div className="flex">
            <Teamcard name="Pat" role="Product Designer" />
            <Teamcard name="Ganesh" role="Polkadot Dev" />
          </div>
        </div>
       
      </div>
    </div>
  );
}

export default Team;

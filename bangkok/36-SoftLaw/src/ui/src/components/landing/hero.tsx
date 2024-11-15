import React from "react";
import { TextSpan } from "@/components/TextSpan";


function Hero() {
const ricardian = "RICARDIAN CONTRACTS".split("");
const ip = "  INTELLECTUAL PROPERTY LICENSE".split("");
const innovation = "  PROOF OF INNOVATION".split("");

    return (
        <div>
             
      <div
        className="relative bg-[url(/images/Container1.svg)] bg-no-repeat bg-cover bg-center w-full h-screen flex justify-center items-center p-[25px] "
      >
       <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1C1A11]"></div>

        <div className="pt-[20px] z-10 ">
          <img src="/images/logoHero.svg" className="w-3/4 mx-auto my-auto lg:w-1/2 min-[2000px]:w-full " />
          <div className="flex items-center flex-col md:flex-row gap-6 mt-10 mb-10 text-yellow-400 justify-center min-[2000px]:text-4xl">
            <div className="md:text-2xl xl:text-3xl flex">
              {ricardian.map((letter, index) => (
                <TextSpan key={index}>
                  {letter === " " ? "\u00A0" : letter}
                </TextSpan>
              ))}
            </div>

            <div className="md:text-2xl xl:text-3xl flex min-[2000px]:text-4xl">
              {ip.map((letter, index) => (
                <TextSpan key={index}>
                  {letter === " " ? "\u00A0" : letter}
                </TextSpan>
              ))}
            </div>
            <div className="sm:text-lg md:text-2xl xl:text-3xl flex min-[2000px]:text-4xl">
              {innovation.map((letter, index) => (
                <TextSpan key={index}>
                  {letter === " " ? "\u00A0" : letter}
                </TextSpan>
              ))}
            </div>
          </div>
        </div>
        {/* </section> */}
      </div>
      
        </div>
    )
}

export default Hero;
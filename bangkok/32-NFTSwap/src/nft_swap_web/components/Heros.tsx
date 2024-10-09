/*
 * @Descripttion:
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-09-30 16:34:40
 * @LastEditors: Hesin
 * @LastEditTime: 2024-10-01 11:24:29
 */
import React from "react";
import { Spotlight } from "./ui/spotlight";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import { TracingBeam } from "./ui/tracing-beam";
import { MagicButton } from "./ui/magic-btn";
import { FaLocationArrow } from "react-icons/fa6";
import { HeroList } from "./HeroList";

const Heros = () => {
  return (
    <TracingBeam className="px-3">
      <div className="pb-20">
        {/* LIGHT */}
        <div>
          <Spotlight
            className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
            fill="white"
          />
          <Spotlight
            className="h-[80vh] w-[50vw] top-10 left-full"
            fill="purple"
          />
          <Spotlight
            className="left-80 top-28 h-[80vh] w-[50vw]"
            fill="skyblue"
          />
        </div>
        {/* GRID */}
        <div
          className="h-screen w-full dark:bg-black-100 bg-white dark:bg-grid-white/[0.03] bg-grid-black-100/[0.2]
       absolute top-0 left-0 flex items-center justify-center"
        >
          <div
            className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black-100
         bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
          />
        </div>

        {/* TITLE */}
        <div className="flex justify-center relative my-20 ">
          <div className="max-w-[95vw] md:max-w-2xl  lg:max-w-[60vw]  flex-col items-center">
            <TextGenerateEffect
              className=" font-bold relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 py-8"
              words="Everything can be reimagined within"
            />
            <h2 className="uppercase tracking-widest text-xs text-center text-blue-100 max-w-80">
              Professional NFT Marketplace
            </h2>
            <MagicButton
              title={"Explore"}
              icon={<FaLocationArrow />}
              position="right"
            />
          </div>
        </div>

        {/* NFTs */}
        <HeroList />
      </div>
    </TracingBeam>
  );
};
export default Heros;

"use client";
import React from "react";
import { TextSpan } from "@/components/TextSpan";
import Link from "next/link";
// import { WalletConnectButton } from "./WalletConnect";

export default function NavBar() {
  const innovation = "Proof Of Innovation".split("");
  const registry = "Registries".split("");
  const ricardian = "Ricardian Contracts".split("");

  return (
    <header className="self-stretch flex py-4 min-[2000px]:px-[320px] px-[200px] items-center bg-[#1C1A11] text-white sticky top-0 z-[100] h-[24] w-full border-b border-[#E5E7EB] backdrop:filter[8px]">
      {/* Desktop View - Full Menu  */}
      <div className="flex justify-between items-start w-full min-[2000px]:py-[25px] py-[16px]">
        <Link href={"/"} className="">
          <img
            src="/images/Logo.svg"
            className="shrink-0 min-[2000px]:w-[300px]"
            loading="lazy"
            alt="Logo"
          />
        </Link>

        <div className="flex items-end justify-between space-x-5">
          <Link
            href={"/Innovation"}
            className="text-white font-normal hover:text-[#facc15] min-[2000px]:text-3xl hidden md:flex focus:text-white"
          >
            {innovation.map((letter, index) => (
              <TextSpan key={index}>
                {letter === " " ? "\u00A0" : letter}
              </TextSpan>
            ))}
          </Link>
          <Link
            href={"/IpSearch"}
            className="text-white font-normal hover:text-[#facc15] min-[2000px]:text-3xl hidden md:flex focus:text-white"
          >
            {registry.map((letter, index) => (
              <TextSpan key={index}>
                {letter === " " ? "\u00A0" : letter}
              </TextSpan>
            ))}
          </Link>
          <Link
            href={"/RicardianContracts"}
            className="text-white font-normal hover:text-[#facc15] min-[2000px]:text-3xl hidden md:flex focus:text-white"
          >
            {ricardian.map((letter, index) => (
              <TextSpan key={index}>
                {letter === " " ? "\u00A0" : letter}
              </TextSpan>
            ))}
          </Link>

     
        </div>

      </div>
    </header>
  );
}

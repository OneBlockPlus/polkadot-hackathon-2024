"use client";

import React from "react";
import { TextSpan } from "@/components/TextSpan";
import Link from "next/link";
import WalletConnect from "./WalletConnect";


export default function NavBar() {
  const dashboard = "Dashboard".split("");
  const legaltech = "Proof of Innovation".split("");
  const licensing = "Licensing".split("");

  return (
    <header className="sticky top-0 z-[100] w-full px-[10px] self-stretch border-b border-[#E5E7EB] bg-[#1C1A11] py-4 text-white backdrop-filter md:px-[120px] min-[2000px]:w-[3000px] min-[2000px]:px-[320px]">
      <div className="flex w-full justify-between items-start py-[16px] min-[2000px]:py-[25px]">
        <Link href="/" prefetch={false}  className="flex items-center">
          <img
            src="/images/Logo.svg"
            className="shrink-0 min-[2000px]:w-[300px]"
            loading="lazy"
            alt="Logo"
          />
        </Link>

        <div className="flex items-center justify-between space-x-5">
          <Link
            href="/dashboard"
            prefetch={false} 
            className="hidden font-normal text-white hover:text-[#facc15] focus:text-white md:flex min-[2000px]:text-3xl"
          >
            {dashboard.map((letter, index) => (
              <TextSpan key={index}>
                {letter === " " ? "\u00A0" : letter}
              </TextSpan>
            ))}
          </Link>

          <Link
            href="/innovation"
            prefetch={false} 
            className="hidden font-normal text-white hover:text-[#facc15] focus:text-white md:flex min-[2000px]:text-3xl"
          >
            {legaltech.map((letter, index) => (
              <TextSpan key={index}>
                {letter === " " ? "\u00A0" : letter}
              </TextSpan>
            ))}
          </Link>

          <WalletConnect />
        </div>
      </div>
    </header>
  );
}

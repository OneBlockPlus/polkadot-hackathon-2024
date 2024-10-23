/*
 * @Descripttion:
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-10-11 17:01:06
 * @LastEditors: Hesin
 * @LastEditTime: 2024-10-22 23:30:57
 */
"use client";
import MobilNav from "@/components/MobilNav";
import Nav from "@/components/Nav";
import Link from "next/link";

// import ConnectButton from "@/components/ConnectButton";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

const ConnectButton = dynamic(() => import("@/components/ConnectButton"), {
  ssr: false,
});
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div
      className={`${
        isScrolled ? "bg-black" : "bg-transparent"
      } fixed top-0 z-50 border-b-2 pt-4 px-0 h-20 xl:h-16 text-white container mx-auto flex justify-between otems-center`}
    >
      {/* logo */}
      <Link href="/">
        <h1 className="text-4xl font-semibold ">
          <Image src={`/images/logo.png`} alt="" width="300" height="30" />
          {/* NFT-Swap <span className="text-white">.</span> */}
        </h1>
      </Link>
      {/* <div className="px-4 py-4 bg-yellow-400 text-white flex justify-between rounded">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <p className="text-sm">The current service is not available. Please stay tuned!</p>
        </div>
       
      </div> */}

      {/* Nav */}
      <div className="z-50 hidden lg:flex items-center gap-8">
        <Nav />
        {/* RAINBOW */}
        <ConnectButton />
      </div>

      {/* mobile nav */}
      <div className="lg:hidden ">
        <MobilNav />
      </div>
    </div>
  );
};
export default Header;

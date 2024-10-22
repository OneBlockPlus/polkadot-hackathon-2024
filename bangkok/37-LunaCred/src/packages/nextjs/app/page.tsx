"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import type { NextPage } from "next";

// import { useAccount } from "wagmi";
// import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  // const { address: connectedAddress } = useAccount();

  return (
    <>
      <AnimatePresence>
        <motion.main
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          <div className=" flex  justify-center   backdrop-blur-lg bg-black dashboard-bg h-screen   dark:text-white font-mono">
            <div className="left-container w-[60%] pl-[5%] flex flex-col justify-between    ">
              <div className="text-container flex flex-col gap-2 flex-1 justify-center">
                <div className="hero-title font-semibold md:text-[36px] text-[18px] text-pink-600 merriweather-regular  ">
                  Welcome to{" "}
                  <Link href="/" className=" text-white">
                    <span className="merriweather-regular">
                      Luna<span className="text-[#07d3ba]">Cred</span>{" "}
                    </span>
                  </Link>
                  ,
                </div>
                <div className="hero-description  md:text-[20px] text-[12px] text-slate-400">
                  Welcome to LunaCred, where trust is the foundation of our decentralized platform built on Moonbeam.
                  Forge authentic connections and drive meaningful change in a community where credibility matters. Earn
                  $LUNA as you participate in shaping a future driven by trust and transparency. Join us and build a
                  trusted digital world.
                </div>
                <div className="button flex ">
                  <Link
                    href={"/dashboard"}
                    className={`button  text-pink-600 md:text-[28px] text-[15px] font-semibold dark:bg-hero-button border-[1px] px-2 border-[#70b7af] mt-8 flex justify-start  cursor-pointer shadow-[#07d3ba] shadow-md hover:shadow-[5px_5px_#07d3ba,_10px_10px_#07d3ba,_15px_15px_rgba(0,0,0,_0.0),_20px_20px_rgba(0,0,0,_0.0),_25px_25px_rgba(112,_113,_232,_0.05)]  `}
                  >
                    Start Staking
                  </Link>
                </div>
              </div>
              <div className="button-container md:flex max-md:absolute max-md:bottom-0 gap-2 md:mb-8">
                <div className="text-[#07d3ba]">Powered by Moonbeam and polkadot</div>
              </div>
            </div>
            <div className="right-container  w-[40%]  h-full ">
              {/* {themeMode !== null && themeMode === "dark" ? (
            <img src={darkmodehome} className="object-cover h-full"></img>
          ) : (
            <img src={lightmodehome} className="object-cover h-full"></img>
          )} */}
            </div>
          </div>
        </motion.main>
      </AnimatePresence>
    </>
  );
};

export default Home;

import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { motion } from "framer-motion";
import useTheme from "../context/theme";

const ethers = require("ethers");
function LandingPage() {
  const navigate = useNavigate();
  const { themeMode } = useTheme();

  const connectWallet = async () => {
    if (window.ethereum) {
      // Check if MetaMask is installed
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Request access to wallet
        const signer = provider.getSigner();
        if (signer) {
          navigate("/verification");
        }
        console.log("Account:", await signer.getAddress());
      } catch (error) {
        console.error(error);
      }
    } else {
      // If MetaMask is not installed, prompt the user to install it
      window.alert("Please install MetaMask!");
    }
  };

  const HowItWorks = () => {
    const HIWCards = ({ sno, heading, description }) => {
      return (
        <div className=" font-mono  flex flex-col gap-2 w-full ">
          <div className="number text-5xl font-semibold text-[#7071E8] ">
            {sno}
          </div>
          <div className="heading text-2xl font-bold text-black  ">
            {heading}{" "}
          </div>
          <div className="description text-xl w-2/3">{description}</div>
        </div>
      );
    };
    return (
      <div className="  w-full mt-8 font-mono ">
        <div className="top-container flex flex-col gap-2">
          <div className="heading-text font-bold text-xl">How it works ?</div>
          <div className="sub-heading-text text-lg mb-6">
            Get started with 3 easy steps{" "}
          </div>
        </div>
        <div className="bottom-container flex justify-center gap-16 w-full">
          <HIWCards
            sno={1}
            heading={"Connect and Verify"}
            description={
              "Receive $DAO tokens by proving your adhaar card's validity, while keeping your sensitive data private. Anon-Adhaar uses zero-knowledge circuits to generate proof."
            }
          />
          <HIWCards
            sno={2}
            heading={"Stake and cast your vote."}
            description={`Stake your $DAO tokens and use them to vote for your friends for them to receive airdrops. Your votes help shape the community's trust network while enhancing your friends credibility score.`}
          />
          <HIWCards
            sno={3}
            heading={"Get rewarded as your credibility score climbs"}
            description={
              "Collect votes from your friends to boost your credibility score and earn more rewards. Increase your credibility and enjoy monthly rewards and exclusive airdrops."
            }
          />
        </div>
      </div>
    );
  };
  console.log("value.themeMode", themeMode);
  return (
    <motion.main
      initial={{ y: -5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      <div className=" flex  justify-center   md:h-[90vh] bg-black   dark:text-white font-mono">
        <div className="left-container w-[60%] pl-[5%] flex flex-col justify-between  ">
          <div className="text-container flex flex-col gap-2 flex-1 justify-center">
            <div className="hero-title font-semibold md:text-[36px] text-[18px] text-pink-600 merriweather-regular  ">
            Welcome to LunaCred, 
            </div>
            <div className="hero-description  md:text-[20px] text-[12px] text-slate-400">
            Welcome to LunaCred, where trust is the foundation of our decentralized platform built on Moonbeam. Forge authentic connections and drive meaningful change in a community where credibility matters. Earn $LUNA as you participate in shaping a future driven by trust and transparency.

Join us and build a trusted digital world.
            </div>
            <div className="button flex ">
              <Link
                to={"/airdrop"}
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
  );
}

export default LandingPage;

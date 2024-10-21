"use client";

import React, { useState } from "react";
import "../App.css";
import { motion } from "framer-motion";
import { PiCopySimpleBold } from "react-icons/pi";
import ClipLoader from "react-spinners/ClipLoader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UserStakeData {
  stake: string;
  credibility: string;
  received: string;
  credibilityGained: string;
}

// interface DashboardProps {
//   // Define any props needed for the Dashboard component

// }

const Dashboard: React.FC = () => {
  const [isStaking, setIsStaking] = useState<boolean>(true);
  const [userStakesData, setUserStakesData] = useState<Record<string, UserStakeData>>({});
  const [inputAddress, setInputAddress] = useState<string>("");
  const [inputAmount, setInputAmount] = useState<string>("");
  const [loadingStakeTx, setLoadingStakeTx] = useState<boolean>(false);
  const [loadingUnstakeTx, setLoadingUnstakeTx] = useState<boolean>(false);

  const formatAddress = (address: string): string => {
    const maxLength = 18;
    return address.length > maxLength
      ? `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
      : address;
  };

  const copyToClipboard = async (wallet: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(wallet);
      toast.success("Address copied!");
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  const handleStake = async (): Promise<void> => {
    setLoadingStakeTx(true);
    try {
      // Implement staking logic here
      // Use inputAddress and inputAmount for the staking process
      console.log(`Staking ${inputAmount} for address ${inputAddress}`);

      // Update userStakesData after successful staking
      setUserStakesData(prevData => ({
        ...prevData,
        [inputAddress]: {
          stake: inputAmount,
          credibility: "0", // You might want to calculate this based on the stake
          received: "0",
          credibilityGained: "0",
        },
      }));

      toast.success("Staking successful!");
    } catch (error) {
      toast.error("Staking failed");
    } finally {
      setLoadingStakeTx(false);
    }
  };

  const handleUnstake = async (): Promise<void> => {
    setLoadingUnstakeTx(true);
    try {
      // Implement unstaking logic here
      // Use inputAddress and inputAmount for the unstaking process
      console.log(`Unstaking ${inputAmount} from address ${inputAddress}`);

      // Update userStakesData after successful unstaking
      setUserStakesData(prevData => {
        const updatedData = { ...prevData };
        if (updatedData[inputAddress]) {
          // Decrease the stake amount (this is a simplified example)
          updatedData[inputAddress].stake = (
            parseFloat(updatedData[inputAddress].stake) - parseFloat(inputAmount)
          ).toString();
        }
        return updatedData;
      });

      toast.success("Unstaking successful!");
    } catch (error) {
      toast.error("Unstaking failed");
    } finally {
      setLoadingUnstakeTx(false);
    }
  };

  return (
    <motion.main
      initial={{ y: -5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      <div className="min-h-screen flex items-center justify-center dashboard-bg backdrop-blur-lg">
        <div className="w-full font-mono text-white pb-5">
          <div className="flex flex-col items-center">
            <div className="dashboard-container w-[90%] mt-4">
              <div className="top-container flex flex-col">
                <div className="heading-container font-bold text-[#fff] text-[32px]">
                  <span className="merriweather-regular">
                    Luna<span className="text-[#07d3ba]">Cred</span> staking
                  </span>
                </div>
                <div className="description-container text-slate-400">
                  Boost your credibility and earn more rewards!
                </div>
              </div>
            </div>
            <div className="main-container flex flex-col md:flex-row justify-between gap-4 mt-4 w-[90%]">
              {/* Staking Container */}
              <div className="credibility-staking-container backdrop-blur-lg bg-white/10 dark:bg-[rgba(112,113,232,0.03)] border-2 rounded-lg border-white/30 p-4 md:p-5 shadow-md md:w-[40%] mb-4 md:mb-0">
                <h1 className="text-2xl font-bold mb-4 text-[#fff] uppercase merriweather-regular underline">
                  Stake on Trust
                </h1>
                <p className="text-sm mb-4">
                  Boost your credibility score and earn more rewards! Ask friends to stake their $GLMR (currently $DEV
                  for testnet) tokens on your address. The more stake you get, the better your credibility score. Use
                  this interface below to Stake on your friends and help them earn more credibility score too!
                </p>
                {/* Staking form */}
                <div className="flex rounded-xl mb-4">
                  <button
                    onClick={() => setIsStaking(true)}
                    className={`px-2 ${
                      isStaking ? "bg-[#07d3ba] text-white" : "bg-white border-2 text-[#07d3ba] border-[#265c55]"
                    }`}
                  >
                    Stake
                  </button>
                  <button
                    onClick={() => setIsStaking(false)}
                    className={`px-2 ${
                      !isStaking ? "bg-[#07d3ba] text-white" : "bg-white border-2 text-[#07d3ba] border-[#265c55]"
                    }`}
                  >
                    Unstake
                  </button>
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  {isStaking ? (
                    <>
                      <label htmlFor="address" className="font-semibold text-[#fff]">
                        Stake for address
                      </label>
                      <input
                        type="text"
                        id="address"
                        placeholder="Enter address"
                        onChange={e => setInputAddress(e.target.value)}
                        className="p-2 rounded outline-none border-2 border-[#07d3ba] dark:bg-white text-black"
                      />
                      <label htmlFor="quantity" className="font-semibold text-[#fff]">
                        Stake Quantity
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        placeholder="Enter quantity"
                        onChange={e => setInputAmount(e.target.value)}
                        className="p-2 rounded border-2 border-[#07d3ba] dark:bg-white dark:text-black"
                      />
                      <button
                        onClick={handleStake}
                        className="flex justify-center items-center w-full p-3 rounded text-white backdrop-blur-lg hover:bg-white/10 transition-colors border border-white/20"
                        disabled={loadingStakeTx}
                      >
                        {!loadingStakeTx && "Stake"}
                        {loadingStakeTx && <ClipLoader color={"white"} size={24} />}
                      </button>
                    </>
                  ) : (
                    <>
                      <label htmlFor="unstake-address" className="font-semibold">
                        Unstake from address
                      </label>
                      <input
                        type="text"
                        id="unstake-address"
                        placeholder="Enter address"
                        onChange={e => setInputAddress(e.target.value)}
                        className="p-2 rounded border-2 border-[#7071E8] dark:bg-white dark:text-black"
                      />
                      <label htmlFor="unstake-quantity" className="font-semibold">
                        Unstake Quantity
                      </label>
                      <input
                        type="text"
                        id="unstake-quantity"
                        placeholder="Enter quantity"
                        onChange={e => setInputAmount(e.target.value)}
                        className="p-2 rounded border-2 border-[#7071E8] dark:bg-white text-black"
                      />
                      <button
                        onClick={handleUnstake}
                        className="flex justify-center items-center w-full text-white dark:bg-red-500 p-3 rounded hover:bg-red-700 transition-colors"
                        disabled={loadingUnstakeTx}
                      >
                        {!loadingUnstakeTx && "Unstake"}
                        {loadingUnstakeTx && <ClipLoader color={"white"} size={24} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
              {/* Main Container */}
              <div className="main-container-cr md:w-[60%] max-h-full flex flex-col gap-4">
                {/* ... (rest of the main container content) */}
              </div>
            </div>
            {/* User Stakes Table */}
            <div className="overflow-y-auto w-[90%] mt-4 border-2 p-2 border-white/30">
              <table className="w-full text-sm table-auto overflow-x-auto">
                <thead>
                  <tr className="border-b-2 border-white/20">
                    <th className="pb-2 text-left text-[#07d3ba]">Address</th>
                    <th className="pb-2 text-center text-[#07d3ba]">Your stake</th>
                    <th className="pb-2 text-center text-[#07d3ba]">Credibility given</th>
                    <th className="pb-2 text-center text-[#07d3ba]">Stakes received</th>
                    <th className="pb-2 text-center text-[#07d3ba]">Credibility gained</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(userStakesData).map(([address, data], index) => (
                    <tr key={index} className="border-b w-4 text-md">
                      <td
                        className="py-2 flex items-center gap-2 text-[#7071E8]"
                        onClick={() => copyToClipboard(address)}
                      >
                        {formatAddress(address)}
                        <PiCopySimpleBold className="text-[#7071E8] cursor-pointer" />
                      </td>
                      <td className="py-2 text-center text-[#7071E8]">{data.stake}</td>
                      <td className="py-2 text-center text-[#7071E8]">{data.credibility}</td>
                      <td className="py-2 text-center text-[#7071E8]">{data.received}</td>
                      <td className="py-2 text-center text-[#7071E8]">{data.credibilityGained}</td>
                    </tr>
                  ))}
                  {Object.keys(userStakesData).length === 0 && (
                    <tr className="flex justify-center items-center pt-2">
                      <td className="flex justify-center items-center">No Data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={true} rtl={false} theme="light" />
      </div>
    </motion.main>
  );
};

export default Dashboard;

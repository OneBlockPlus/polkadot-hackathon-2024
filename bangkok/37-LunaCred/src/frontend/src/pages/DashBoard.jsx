import React, { useState, useEffect } from "react";
import { PiCopySimpleBold } from "react-icons/pi";
import { ethers } from "ethers";
// import { createClient, cacheExchange, fetchExchange } from "urql";
import ClipLoader from "react-spinners/ClipLoader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import RankIcon from "../assets/rankIcon.svg";
// import AvailableMandeIcon from "../assets/availableMandIcon.svg";
// import LockedMand from "../assets/lockedMandIcon.svg";
import infoIcon from "../assets/infoIcon.svg";
import { motion } from "framer-motion";
import '../App.css'

moment.updateLocale("en", {
  relativeTime: {
    future: (diff) => (diff == "Just now" ? diff : `in ${diff}`),
    past: (diff) => (diff == "Just now" ? diff : `${diff} ago`),
    s: "Just now",
    ss: "Just now",
    m: "a min",
    mm: "%d mins",
  },
});

// this is dashboard for lunacred

function Dashboard({ value }) {
  const [isStaking, setIsStaking] = useState(true);

  const [userStakesData, setUserStakesData] = useState({});
  const [userRank, setUserRank] = useState(0);

  const [stakeForAddress, setStakeForAddress] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");

  const [loadingStakeTx, setLoadingStakeTx] = useState(false);
  const [loadingUnstakeTx, setLoadingUnstakeTx] = useState(false);
  const [loadingClaimTx, setLoadingClaimTx] = useState(false);


  const formatAddress = (address) => {
    const maxLength = 18;
    return address.length > maxLength
      ? `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
      : address;
  };
  const truncateAmount = (amount, precision = 4, decimals = 18) => {
    const formattedAmount = ethers.utils.formatUnits(amount, decimals);
    let [whole, decimal] = formattedAmount.split(".");
    // toFixed will add imprecision to the number in some cases (parseFloat("1.9999").toFixed(18)),
    // so we manually pad the number
    while (decimal && decimal.length < precision) {
      decimal += "0";
    }
    decimal = decimal.substring(0, precision);

    return precision != 0 ? `${whole}.${decimal}` : whole;
  };

  const copyToClipboard = async (wallet) => {
    try {
      await navigator.clipboard.writeText(wallet);
      toast.success("Address copied!");
    } catch (err) {
      // Handle the error case
    }
  };


  return (
    <motion.main
      initial={{ y: -5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      {/* <div class="bg-gradient-to-br from-pink-500 via-purple-700 to-teal-800 min-h-screen flex items-center justify-center"> */}
      {/* <!-- Your glass cards go here --> */}
      <div class=" min-h-screen flex items-center justify-center dashboard-bg backdrop-blur-lg">
      {/* <div class="bg-black min-h-screen flex items-center justify-center "> */}
      {/* <div class="bg-black min-h-screen grid grid-cols-12 grid-rows-12 gap-4"> */}
      <div className="  w-full  font-mono  text-white pb-5">
        <div className="flex flex-col items-center  ">
          <div className="dashboard-container  w-[90%]  mt-4 ">
            <div className="top-container flex flex-col ">
              <div className="heading-container font-bold text-[#fff] text-[32px]">
               <span className="merriweather-regular">
               Luna<span className="text-[#07d3ba]">Cred</span>   staking</span> 
              </div>
              <div className="description-container text-slate-400">
                Boost your credibility and earn more rewards!
              </div>
            </div>
          </div>
          <div className="main-container  flex flex-col md:flex-row justify-between gap-4 mt-4 w-[90%]">
            <div className="credibility-staking-container backdrop-blur-lg bg-white/10 dark:bg-[rgba(112,113,232,0.03)] border-2 rounded-lg border-white/30  p-4 md:p-5 shadow-md md:w-[40%] mb-4 md:mb-0 ">
              <h1 className="text-2xl font-bold mb-4  text-[#fff] uppercase merriweather-regular  underline ">
                Stake on Trust
              </h1>
              <p className="text-sm mb-4">
                Boost your credibility score and earn more rewards! Ask friends
                to stake their $GLMR (currently $DEV for testnet) tokens on your address. The more stake you
                get, the better your credibility score. Use this interface below
                to Stake on your friends and help them earn more credibility
                score too!
              </p>

              <div className="flex rounded-xl  mb-4">
                <button
                  onClick={() => setIsStaking(true)}
                  className={` px-2  ${
                    isStaking
                      ? "bg-[#07d3ba] text-white"
                      : "bg-white border-2 text-[#07d3ba] border-[#265c55]"
                  }`}
                >
                  Stake
                </button>
                <button
                  onClick={() => setIsStaking(false)}
                  className={`  px-2 ${
                    !isStaking
                      ? "bg-[#07d3ba] text-white"
                      : "bg-white border-2 text-[#07d3ba] border-[#265c55]"
                  }`}
                >
                  Unstake
                </button>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                {isStaking ? (
                  <>
                    <label
                      htmlFor="address"
                      className="font-semibold text-[#fff] "
                    >
                      Stake for address
                    </label>
                    <input
                      type="text"
                      id="address"
                      placeholder="Enter address"
                      onChange={(e) => setStakeForAddress(e.target.value)}
                      className="p-2 rounded outline-none border-2 border-[#07d3ba] dark:bg-white text-black"
                    />
                    <label
                      htmlFor="quantity"
                      className="font-semibold text-[#fff]"
                    >
                      Stake Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      placeholder="Enter quantity"
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="p-2 rounded border-2 border-[#07d3ba]  dark:bg-white dark:text-black"
                    />
                   <button
  //   onClick={handleStake}
  className="flex justify-center items-center w-full p-3 rounded text-white  backdrop-blur-lg hover:bg-white/10 transition-colors border border-white/20"
  //   disabled={stakeTxConfirming || stakeTxPending}
>
  {!loadingStakeTx && "Stake"}
  {loadingStakeTx && <ClipLoader color={"white"} size={24} />}
</button>

                    Note: Your wallet must be linked to your twitter account to
                    stake
                  </>
                ) : (
                  <>
                    <label htmlFor="address" className="font-semibold">
                      Unstake from address
                    </label>
                    <input
                      type="text"
                      id="address"
                      placeholder="Enter address"
                      onChange={(e) => setStakeForAddress(e.target.value)}
                      className="p-2 rounded border-2 border-[#7071E8]  dark:bg-white dark:text-black"
                    />{" "}
                    <label htmlFor="address" className="font-semibold">
                      Unstake Quantity
                    </label>
                    <input
                      type="text"
                      id="address"
                      placeholder="Enter quantity "
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="p-2 rounded border-2 border-[#7071E8]  dark:bg-white text-black"
                    />
                    <button
                    //   onClick={handleUnstake}
                      className="flex justify-center items-center w-full text-white dark:bg-red-500 p-3 rounded hover:bg-red-700 transition-colors"
                    //   disabled={unstakeTxConfirming || unstakeTxPending}
                    >
                      {!loadingUnstakeTx && "Unstake"}
                      {loadingUnstakeTx && (
                        <ClipLoader color={"white"} size={24} />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="main-container-cr md:w-[60%] max-h-full flex flex-col gap-4 ">
              <div
                className="claim-rewards-container 
               px-4 py-2 flex flex-col  gap-4 h-full"
              >
                <div className="top-data-container flex flex-col gap-2">
                 
                  <div className="top-container relative dark:bg-black/30  backdrop-blur-lg w-[96%] m-[0.79rem] flex max-md:flex-col justify-around py-4 rounded-lg shadow-lg border border-white/20 ">
  <div className="data-container flex-1 flex flex-col items-center justify-center max-md:pb-5">
    <div className="title text-[#fff]">Rank</div>
    <div className="data-value-container text-[24px] flex gap-[4px]">
      <img src={RankIcon}></img>
      <div className="dark:text-white">{userRank}</div>
    </div>
  </div>
  
  <div className="data-container flex flex-col flex-1 items-center justify-center max-md:pb-5 md:border-l-[1px] md:border-[#7071E8]/50">
    <div className="title text-[#fff]">Available $GLMR</div>
    <div className="data-value-container text-[24px] flex gap-[4px]">
      <img src={''} alt="available coins"></img>
      <div className="dark:text-white">
        {/* {mandBalance?.value ? truncateAmount(mandBalance.value) : 0} */}
      </div>
    </div>
  </div>
  
  <div className="data-container flex flex-col items-center justify-center flex-1 md:border-l-[1px] md:border-[#7071E8]/50">
    <div className="title text-[#fff]">Locked $GLMR</div>
    <div className="data-value-container text-[24px] flex gap-[4px]">
      <img src={''} alt="locked coins"></img>
      <div className="dark:text-white">
        {/* {stakedBalance?.result ? truncateAmount(stakedBalance.result) : 0} */}
      </div>
    </div>
  </div>
</div>

              
                  <div className="bottom-container flex max-md:flex-col justify-around">
                  <div className="data-container flex flex-col gap-2 items-center justify-center w-[30%] max-md:w-[100%]  dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-black/40 shadow-lg rounded-xl p-4">
  <div className="title mt-2 text-[#07d3ba] dark:text-[#7071E8]">
    Credibility staking rewards
  </div>
  <div className="bottom-claim-container flex justify-between items-center w-full px-4">
    <div className="data-value-container text-[24px] flex gap-[4px]">
      <div className="text-xl dark:text-white">
        {/* {allocatedTokens?.result
          ? truncateAmount(allocatedTokens.result)
          : 0} */}
      </div>
    </div>
    <button
      className="flex justify-center items-center w-[50%] claim-btn text-lg text-white bg-claim-btn-gradient px-2 rounded-md border-[2px] border-[#265c55]"
      //   onClick={handleClaim}
      //   disabled={claimTxConfirming || claimTxPending} 
    >
      {!loadingClaimTx && "Claim"}
      {loadingClaimTx && <ClipLoader color={"white"} size={24} />}
    </button>
  </div>
  <div className="info-container bg-white/10 dark:text-black text-white backdrop-blur-lg flex items-center gap-2 w-full p-2 mt-2 rounded-md">
    <img src={infoIcon} alt="info icon" />
    <div className="text-[10px] font-semibold text-center">
      Rewards are distributed weekly
    </div>  
  </div>
</div>
<div className="data-container flex flex-col items-center justify-between w-[30%] max-md:mt-2 max-md:w-[100%]  dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-black/40 shadow-lg rounded-xl p-4">
  <div className="title mt-2 text-[#07d3ba]">
  Your credibility score
  </div>

  <div className="data-value-container text-[24px] flex gap-[4px] items-center">
    <div className="text-2xl dark:text-white">
      {/* {weeklyYield?.result
        ? truncateAmount(weeklyYield.result, 0, 14)
        : 0} */}
      0 CRED
    </div>
  </div>
  
  <div className="info-container bg-white/10 backdrop-blur-lg dark:text-black text-white flex items-center gap-2 w-full p-2 mt-2 rounded-md">
    <img src={infoIcon} alt="info icon" />
    <div className="text-[10px] font-semibold text-center">
    To increase your credibility get more friends to stake on your address
    </div>
  </div>
</div>

<div className="data-container flex flex-col items-center justify-between w-[30%] max-md:mt-2 max-md:w-[100%]  dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-black/40 shadow-lg rounded-xl p-4">
  <div className="title mt-2 text-[#07d3ba] ">
    Weekly yield
  </div>

  <div className="data-value-container text-[24px] flex gap-[4px] items-center">
    <div className="text-2xl dark:text-white">
      {/* {weeklyYield?.result
        ? truncateAmount(weeklyYield.result, 0, 14)
        : 0} */}
      % of CRED
    </div>
  </div>
  
  <div className="info-container bg-white/10 dark:text-black text-white flex items-center gap-2 w-full p-2 backdrop-blur-lg  mt-2 rounded-md">
    <img src={infoIcon} alt="info icon" />
    <div className="text-[10px] font-semibold text-center">
      You might get up to{" "}
      {/* {((weeklyYield?.result
        ? truncateAmount(weeklyYield.result, 0, 14)
        : 0) *
        (credScore?.result
          ? ethers.utils.formatUnits(credScore.result, 2)
          : 0)) /
        100}{" "} */}
      MAND by Thursday 00:01 UTC
    </div>
  </div>
</div>

                  </div>
                </div>

                <div
  className={`credibiliy-rewards-container  bg-white/10 backdrop-blur-lg h-[60%] text-white placeholder:p-2 p-2 m-4 dark:bg-black/20 dark:text-white border border-white/20 rounded-lg`}
>
  <div className="heading text-2xl font-bold text-[#07d3ba] merriweather-regular mb-2">
    How is credibility calculated?
  </div>
  <div className="description">
    When your friend stakes 25 $GLMR tokens on your address you get √25 = 5 credibility points. This is{" "}
    <a
      target="_blank"
      href="https://towardsdatascience.com/what-is-quadratic-voting-4f81805d5a06"
      className="text-[#07d3ba] font-semibold underline"
    >
      Quadratic voting
    </a>.
  </div>
  <br />
  <div className="description flex flex-col gap-2">
    Quadratic voting rewards more people supporting you over the number of tokens staked on you. For example, if one friend stakes 100 $GLMR tokens on your address, you get √100 = 10 credibility points. However, if 4 different friends each stake 25 $GLMR tokens, you get 4 * √25 = 20 credibility points.
    <br />
  </div>
</div>

              </div>
            </div>
          </div>
          <div className="overflow-y-auto w-[90%] mt-4 border-2 p-2 border-white/30 ">
            <table className="w-full text-sm table-auto overflow-x-auto">
              <thead>
                <tr className="border-b-2 border-white/20  ">
                  <th className="pb-2 text-left text-[#07d3ba]">Address</th>
                  <th className="pb-2 text-center text-[#07d3ba]">
                    Your stake
                  </th>
                  <th className="pb-2 text-center text-[#07d3ba]">
                    Credibility given
                  </th>
                  <th className="pb-2 text-center text-[#07d3ba]">
                    Stakes received
                  </th>
                  <th className="pb-2 text-center text-[#07d3ba]">
                    Credibility gained
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(userStakesData).map((data, index) => (
                  <tr key={index} className="border-b w-4  text-md">
                    <td
                      className="py-2 flex items-center gap-2 text-[#7071E8]"
                      onClick={() => copyToClipboard(data)}
                    >
                      {formatAddress(data)}
                      <PiCopySimpleBold className="text-[#7071E8] cursor-pointer" />
                    </td>
                    <td className="py-2 text-center text-[#7071E8]">
                      {userStakesData[data].stake}
                    </td>
                    <td className="py-2 text-center text-[#7071E8]">
                      {userStakesData[data].credibility}
                    </td>
                    <td className="py-2 text-center text-[#7071E8]">
                      {userStakesData[data].received}
                    </td>
                    <td className="py-2 text-center text-[#7071E8]">
                      {userStakesData[data].credibilityGained}
                    </td>
                  </tr>
                ))}
                {Object.keys(userStakesData).length === 0 && (
                  <tr className="flex justify-center items-center pt-2">
                    <td className="flex justify-center items-center">
                      No Data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={true}
        rtl={false}
        theme="light"
      />
      </div>
    </motion.main>
  );
}

export default Dashboard;
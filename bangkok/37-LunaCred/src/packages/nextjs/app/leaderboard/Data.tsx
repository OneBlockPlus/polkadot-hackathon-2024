"use client";

import React, { useEffect, useState } from "react";
import infoIcon from "../../public/infoIcon.svg";
import RankIcon from "../../public/rankIcon.svg";
import { HydrationBoundary, QueryClient, dehydrate, useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { PiCopySimpleBold } from "react-icons/pi";
import ClipLoader from "react-spinners/ClipLoader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";

const Dashboard: React.FC = () => {
  const { address } = useAccount();

  function convertWeiToEther(weiValue: bigint) {
    console.log("weiValue", weiValue);

    if (!weiValue) {
      return "Invalid address";
    }
    return Number(formatEther(weiValue)).toFixed(1);
  }

  const getData = () => {
    const { data, isError, isLoading } = useBalance({
      address,
    });
    return Number(data?.formatted).toFixed(1);
  };

  console.log("data", getData());
  const query = gql`
    {
      deposits(first: 5) {
        id
        from
        recipient
        value
        credibilityAdded
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `;
  const url = "https://api.studio.thegraph.com/query/92118/lunacred-subgraph/version/latest";
  // await queryClient.prefetchQuery({

  const { data } = useQuery({
    queryKey: ["data"],
    async queryFn() {
      return await request(url, query);
    },
  });
  console.log(data);

  return (
    <>
      <div className="dashboard-bg flex justify-center  h-screen pt-20">
        <div className="overflow-y-auto w-[90%] mt-4 border-2 p-2 border-white/30 ">
          <table className="w-full text-sm table-auto overflow-x-auto">
            <thead>
              <tr className="border-b-2 border-white/20  ">
                <th className="pb-2 text-left text-[#07d3ba]">Address</th>
                <th className="pb-2 text-center text-[#07d3ba]">Your stake</th>
                <th className="pb-2 text-center text-[#07d3ba]">Staked on Address</th>
                <th className="pb-2 text-center text-[#07d3ba]">Credibility gained</th>
              </tr>
            </thead>
            <tbody>
              {data && (data as any).deposits ? (
                (data as any).deposits.map((credibilityUpdated: any) => (
                  <tr key={credibilityUpdated.id} className="border-b-2 border-white/20">
                    <td className="py-2 text-left">{String(credibilityUpdated.from).substring(0, 30)}</td>
                    <td className="py-2 text-center">{convertWeiToEther(credibilityUpdated.value) + " DEV"}</td>
                    <td className="py-2 text-center">{credibilityUpdated.recipient}</td>
                  </tr>
                ))
              ) : (
                <></>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={true} rtl={false} theme="light" />
    </>
  );
};

export default Dashboard;

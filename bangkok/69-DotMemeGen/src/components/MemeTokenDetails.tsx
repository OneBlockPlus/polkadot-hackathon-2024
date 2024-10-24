"use client";

import dayjs from "dayjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ClockCircleOutlined,
  ArrowLeftOutlined,
  LockFilled,
} from "@ant-design/icons";
import Address from "./Address";
import Markdown from "./Markdown";
import MintToken from "./MintToken";
import useUserDetailsContext from "../context";
import nextApiClientFetch from "../utils/nextApiClientFetch";
import { ICoin } from "../types";
import getEncodedAddress from "../utils/getEncodedAddress";

interface Props {
  className?: string;
  symbol: string | null;
}

const network = process.env.PUBLIC_NETWORK;
const MemeTokenDetails = ({ className, symbol }: Props) => {
  const { loginAddress } = useUserDetailsContext();
  const [tokenDetails, setTokenDetails] = useState<ICoin | null>(null);

  const getTokenDetails = async () => {
    if (!symbol) return;

    const { data, error } = await nextApiClientFetch<ICoin>(
      "/api/getSingleTokenDetails",
      {
        token: symbol,
      },
    );
    if (data) {
      setTokenDetails(data);
    }
    if (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTokenDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  return (
    <div className={className}>
      <Link
        className="text-primaryButton hover:text-primaryButton flex items-center gap-1"
        href={"/"}
      >
        <ArrowLeftOutlined />
        Back to tokens
      </Link>
      {tokenDetails && (
        <div className="pl-4 w-full flex flex-col gap-4">
          <div className="flex gap-2 items-center w-2/3">
            <label className="text-3xl text-primaryText font-bold">
              {tokenDetails?.name || ""}
            </label>
          </div>
          <div className="flex gap-4 mt-0 ">
            <div className=" border-primaryButton w-2/3 mt-0">
              <div className="bg-primaryButton text-white flex justify-between rounded-t-2xl px-6 py-6 items-center">
                <span className="text-xl font-semibold">
                  {tokenDetails?.title || ""}
                </span>
                {![
                  ...(tokenDetails?.mintedByAddresses || []),
                  tokenDetails?.proposer,
                ]?.includes(
                  getEncodedAddress(loginAddress, network || "polkadot") || "",
                ) && (
                  <span>
                    <LockFilled className="text-2xl" />
                  </span>
                )}
              </div>
              <div className="border-solid border-primaryButton bg-white border-t-0 border-l-[1px] border-b-[1px] border-r-[1px] p-6 text-primaryText text-sm font-medium">
                {[
                  ...(tokenDetails?.mintedByAddresses || []),
                  tokenDetails?.proposer,
                ]?.includes(
                  getEncodedAddress(loginAddress, network || "polkadot") || "",
                ) ? (
                  <Markdown md={tokenDetails?.content || ""} />
                ) : (
                  <div className="flex items-center justify-center">
                    <div className="text-sm font-medium flex flex-col gap-2 items-center justify-center">
                      <span>
                        Mint your token to get access of this discussion
                      </span>
                      <MintToken
                        token={tokenDetails}
                        setTokenDetails={setTokenDetails}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-primaryButton w-1/3 mt-0">
              <div className="bg-primaryButton text-white flex justify-between rounded-t-2xl px-6 py-4 items-center">
                <span className="text-xl font-semibold">Details</span>
                <div className="text-xs text-white font-semibold flex gap-1 items-center">
                  <span>Created At:</span>
                  <ClockCircleOutlined />
                  <span>
                    {dayjs(tokenDetails?.createdAt).format("D MMM 'YY")}
                  </span>
                </div>
              </div>
              <div className="border-solid border-primaryButton bg-white border-t-0 border-l-[1px] border-b-[1px] border-r-[1px] p-6 text-primaryText text-sm font-medium">
                <div className="border-primaryButton border-t-0 border-solid border-b-[1px] flex gap-4 justify-between items-center py-4">
                  <span className="w-full gap-x-1.5 flex items-center justify-start">
                    Author:{" "}
                    <Address address={tokenDetails?.proposer} maxLength={8} />
                  </span>
                  <span className="w-full gap-x-1.5 flex items-center justify-start">
                    Total Supply: {tokenDetails?.totalSupply}
                  </span>
                </div>
                <div className="flex gap-6 justify-between items-center pt-4">
                  <span className="w-full gap-x-1.5 flex items-center justify-start">
                    Holders: {tokenDetails?.mintCount || 0}
                  </span>
                  <span className="w-full gap-x-1.5 flex items-center justify-start">
                    Limit per mint: {tokenDetails?.limit || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemeTokenDetails;

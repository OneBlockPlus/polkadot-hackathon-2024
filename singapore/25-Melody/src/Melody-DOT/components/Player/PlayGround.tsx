import { TbPlayerPause, TbPlayerPlay } from "react-icons/tb";
import { DefaultThumbnail } from "./DefaultThumbnail";
import { usePlayer } from "./usePlayer";
import { FaEdit } from "react-icons/fa";
import { Button } from "../ui/button";
import { MdPlayCircle } from "react-icons/md";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SecondNFT from "@/components/SecondNFT";
import { useEffect, useState } from "react";

import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { melodyAbi } from "@/contracts/abi";
import { getPinataData } from "@/utils/config";
import { FaArrowsAltV } from "react-icons/fa";
import { musics } from "./musics";
export const PlayGround = () => {
  const { playList, setCurrentMusic, currentMusic } = usePlayer();
  const [musicList, setmusicList] = useState([]);
  const publicClient = usePublicClient();
  const [isColl, setisColl] = useState(-1);

  const contractAddress = process.env
    .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

  const extractCID = (ipfsUrl) => {
    // 去掉前缀 "ipfs://"
    const urlWithoutPrefix = ipfsUrl.replace("ipfs://", "");
    // 分割字符串，CID 在第一个 '/' 之前
    const cid = urlWithoutPrefix.split("/")[0];
    const url = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cid}`;
    return url;
  };
  useEffect(() => {}, [setisColl, isColl]);

  const getList = async () => {
    if (!publicClient) throw new Error("Public client is not available");
    const wagmiContract = {
      address: contractAddress,
      abi: melodyAbi,
    };
    const data = await publicClient.readContract({
      ...wagmiContract,
      functionName: "totalSupply",
    });

    const totalSupply =
      typeof data === "bigint" ? Number(data) : Number(data[0]);
    let arr = [];
    for (let i = 1; i < totalSupply; i++) {
      arr.push({
        ...wagmiContract,
        functionName: "tokenURI",
        args: [i],
      });
    }

    const tokenURIList = await publicClient.multicall({ contracts: arr });

    const dataPromises = tokenURIList.map(async (itm) => {
      const data = await new Promise((resolve) =>
        getPinataData(itm.result, resolve)
      );
      return {
        name: data.name,
        src: extractCID(data.mediaUri),
        image: "",
      };
    });

    // Wait for all promises to resolve
    const list = await Promise.all(dataPromises);

    console.log("***listlistlistlistlist***");
    setmusicList(list);
  };
  useEffect(() => {
    console.log("musicList", musicList);
  }, [musicList, setmusicList]);

  useEffect(() => {
    try {
      getList();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  return (
    <div className="relative">
      {musicList.map((music, idx) => {
        const isPlaying = currentMusic.src === music.src;
        console.log("first", musicList);
        return (
          <>
            <div
              key={idx}
              // className={`
              //   ${isPlaying ? " border-accent-500" : "border-transparent"}
              //    flex gap-2 text-xs relative cursor-pointer transition-shadow duration-300 shadow-lg hover:shadow-none bg-gradient-radial rounded-2xl overflow-hidden text-white border-2 border-dashed`}
              className={`
            flex justify-between items-center gap-2 text-xs my-4 py-4 border-t-2 border-b-2 border-slate-700 relative cursor-pointer transition-shadow duration-300 shadow-lg overflow-hidden text-white`}
            >
              <div>{idx + 1}</div>
              {/* LEFT */}
              <div
                className="w-24 h-24 relative group"
                onClick={() => {
                  setCurrentMusic(music, true);
                }}
              >
                {music.image ? (
                  <img
                    src={music.image}
                    // alt={music.title}
                    className="rounded-lg h-full w-full object-cover"
                  />
                ) : (
                  <DefaultThumbnail />
                )}

                {/* Hover Mask */}
                <div className="flex justify-center items-center absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <MdPlayCircle className="text-5xl" />
                </div>
              </div>
              {/* RIGHT */}
              <div className="w-5/6 flex flex-col gap-2 justify-center bg-gradient-to-l from-zinc-700   p-6">
                <h6 className="font-semibold text-sm">{music.name}</h6>
                {/* <p className="text-xs text-gray-400">{music.artist}</p> */}
                <Sheet>
                  <SheetTrigger className="flex justify-center text-primary items-center bg-accent hover:bg-accent-hover px-4 py-4 rounded-full flex items-center gap-2 absolute right-4 top-1/2 transform -translate-y-1/2">
                    <FaEdit />
                  </SheetTrigger>

                  <SheetContent className="flex flex-col">
                    <SecondNFT music={music} id={idx} setisColl={setisColl} />
                  </SheetContent>
                </Sheet>
                {/* <span className="px-4 py-4 rounded-full bg-red-300 ">{isColl && idx == 0 && <FaArrowsAltV />}</span> */}
              </div>
              {/* <div className="w-1/12 flex justify-center items-center text-3xl bg-black/10">
                {isPlaying ? <TbPlayerPause /> : <TbPlayerPlay />}
              </div> */}
            </div>
            {idx == isColl && (
              <audio controls>
                <source src={musics[0].src} type="audio/mp3" />
              </audio>
            )}
          </>
        );
      })}
    </div>
  );
};

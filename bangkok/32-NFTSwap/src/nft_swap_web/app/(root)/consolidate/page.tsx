"use client";
import Image from "next/image";
import { Tabs } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/check-box";
import { useEffect, useState } from "react";
import { useSubstrateContext } from "@/app/SubstrateProvider";
import { FiEdit } from "react-icons/fi";
import { useToast } from "@/hooks/use-toast";
import { sendAndWait } from "@/utils/sendAndWait";
import { Button } from "@/components/ui/button";

import { FaRegCircleCheck } from "react-icons/fa6";
import { LuFileStack } from "react-icons/lu";
import { RiErrorWarningLine } from "react-icons/ri";
import Footer from "@/components/Footer";
import { hexCodeToString } from "@/utils/util";
import ReactDOMServer from "react-dom/server";

const Consolidate = () => {
  const [mergeBtn, setmergeBtn] = useState(false);
  const [splitBtn, setsplitBtn] = useState(false);
  const [datas, setdatas] = useState([]);

  const { toast } = useToast();
  const { api, allAccounts, injector, extensionEnabled, pending, setPending } =
    useSubstrateContext();

  useEffect(() => {
    // console.log("mergeBtn", mergeBtn);
    // console.log("splitBtn", splitBtn);
  }, [mergeBtn, setmergeBtn, splitBtn, setsplitBtn]);
  useEffect(() => {
    fetchCollectionIds();
  }, [api]);
  const fetchCollectionIds = async () => {
    if (!api) return; // 如果 api 尚未初始化，直接返回

    try {
      const connectedAccount = localStorage.getItem("connectedAccount");
      // console.log(connectedAccount);
      const nfts: any = await api.query.nftModule.ownedNFTs(connectedAccount);
      const datas = JSON.parse(nfts);

      // console.log("datas", datas);
      const newData: any = await Promise.all(
        datas.map(async (i: any) => {
          let status = await getNftConsolidateStatus(i[0], i[1]);
          // 获取每一个集合的信息
          const nftInfo = await api.query.nftModule.nftCollections(i[0]);
          const [maxItem, curIndex, metainfo] = JSON.parse(
            JSON.stringify(nftInfo)
          );
          const nftMetaInfo = JSON.parse(hexCodeToString(metainfo).slice(1));
          // // console.log("nftMetaInfo", nftMetaInfo);
          return {
            nft: i,
            status: status,
            url: nftMetaInfo.url,
            name: nftMetaInfo.name,
            desc: nftMetaInfo.desc,
          };
        })
      );
      // console.log("Fetched Data:", newData);
      setdatas(newData);
    } catch (error) {
      console.error("Error fetching collection IDs:", error);
    }
  };

  const getNftConsolidateStatus = async (
    collectionId: any,
    itemIndex: any
  ): Promise<string> => {
    // console.log("[Query] nftDetails");
    const nftDetails = await api?.query.nftModule.nftDetails([
      collectionId,
      itemIndex,
    ]);
    //// console.log(`nftDetails: ${nftDetails}`);
    const { mergedNft, subNfts, metadata } = JSON.parse(
      JSON.stringify(nftDetails)
    );
    //// console.log(
    //  `mergedNft: ${mergedNft}, subNfts: ${subNfts}, metadata: ${metadata}`
    //);
    let status: string = "";
    if (subNfts.length > 0) {
      status = "merged"; // merge的nft
      // console.log("merged nft");
    } else if (mergedNft == null) {
      status = "general"; // 普通没有merge的nft
      // console.log("general nft");
    } else {
      status = "sub"; // 该nft已被merge，当前不可用
      // console.log("sub(frozen) nft");
    }
    return status;
  };

  // handleMerge
  const handleMerge = async () => {
    // console.log("合并");
    let dd: any = [];
    datas.filter((i: any) => {
      if (i.checked && i.checked == true) {
        dd.push([i.nft[0], i.nft[1]]);
      }
    });
    // console.log("dd", dd);
    if (dd.length < 2 || dd.length > 10) {
      toast({
        title: (
          <div className="flex items-center">
            <RiErrorWarningLine
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            Collection Number must be more than 2 and less than 10
          </div>
        ) as unknown as string,
        variant: "warning",
      });
    } else {
      // console.log("[Call] mergeNfts");
      let tx = api?.tx.nftModule.mergeNfts(dd);
      try {
        setPending(true);
        const currentAccount = allAccounts[0];
        // console.log("currentAccount", currentAccount);
        let hash = await sendAndWait(
          api,
          tx,
          currentAccount,
          extensionEnabled,
          injector
        );
        // console.log(`mint hash: ${hash.toHex()}`);
        fetchCollectionIds();
        toast({
          title: (
            <div className="flex items-center">
              <FaRegCircleCheck
                size={50}
                style={{ fill: "white", marginRight: "2rem" }}
              />
              Successful Merge!!
            </div>
          ) as unknown as string,
          // description: "Friday, February 10, 2023 at 5:57 PM",
          variant: "success",
        });
      } catch (error: any) {
        // console.log(`merge error: ${error}`);
        toast({
          title: (
            <div className="flex items-center">{error}</div>
          ) as unknown as string,
          variant: "destructive",
        });
      } finally {
        setPending(false);
        setmergeBtn(false);
        setsplitBtn(false);
      }
    }
  };
  // handleSplit
  const handleSplit = async () => {
    // console.log("拆分");
    let dd: any = [];

    datas.filter((i: any) => {
      if (i.checked && i.status == "merged" && i.checked == true) {
        dd.push([i.nft[0], i.nft[1]]);
      }
    });
    // console.log("dd", dd);
    if (dd.length > 1 || dd.length == 0) {
      toast({
        title: (
          <div className="flex items-center">
            <RiErrorWarningLine
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            Collection Number must be 1
          </div>
        ) as unknown as string,
        variant: "warning",
      });
    } else {
      // console.log("[Call] splitNft");
      let tx = api?.tx.nftModule.splitNft([dd[0][0], dd[0][1]]);
      try {
        setPending(true);
        const currentAccount = allAccounts[0];
        // console.log("currentAccount", currentAccount);
        let hash: any = await sendAndWait(
          api,
          tx,
          currentAccount,
          extensionEnabled,
          injector
        );
        // console.log(`split hash: ${hash.toHex()}`);
        fetchCollectionIds();
        toast({
          title: (
            <div className="flex items-center">
              <FaRegCircleCheck
                size={50}
                style={{ fill: "white", marginRight: "2rem" }}
              />
              Successful Split ! 
            </div>
          ) as unknown as string,
          // description: hash.toHex(),
          variant: "success",
        });
      } catch (error: any) {
        // console.log(`split error: ${error}`);
        toast({
          title: (
            <div className="flex items-center">{error}</div>
          ) as unknown as string,
          description: "Fail",
          variant: "destructive",
        });
      } finally {
        setPending(false);
        setmergeBtn(false);
        setsplitBtn(false);
      }
    }
  };
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden sm:px-10 px-5">
      <Header />

      <div className="max-w-[80%] w-full relative  flex flex-col my-20  items-start justify-start">
        <div className="absolute left-0 z-20 flex items-center space-x-2 mt-20">
          <Input className="w-[200px]" />
          <Button className="">Search</Button>
          <Button
            onClick={() => {
              setmergeBtn(!mergeBtn);
              setsplitBtn(false);
            }}
          >
            {mergeBtn && <FiEdit />}merge
          </Button>
          <Button
            onClick={() => {
              setsplitBtn(!splitBtn);
              setmergeBtn(false);
            }}
          >
            {splitBtn && <FiEdit />} Split
          </Button>
          {(mergeBtn || splitBtn) && (
            <Button
              onClick={() => {
                if (mergeBtn) {
                  handleMerge();
                } else if (splitBtn) {
                  handleSplit();
                }
              }}
              className="px-4 py-2 rounded-md uppercase bg-purple-300 hover:-translate-y-1 transform transition duration-200 hover:shadow-md"
            >
              Submit
            </Button>
          )}
        </div>
        <div className="mt-40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* 遍历 Art 类别下的 NFT */}
          {datas
            .filter((item: any) => item.status !== "sub") // 先过滤掉状态为 "sub" 的项目
            .map((item, idx) => (
              <DummyContent
                key={`${item[0]}-${idx}`}
                item={item}
                status={(item as { status: string }).status}
                mergeBtn={mergeBtn}
                splitBtn={splitBtn}
                datas={datas}
                setdatas={setdatas}
              />
            ))}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Consolidate;

// 定义 DummyContent 组件的 props 类型
type DummyContentProps = {
  item: any;
  mergeBtn: any;
  splitBtn: any;
  status: string;
  datas: any;
  setdatas: any;
};
const DummyContent: React.FC<DummyContentProps> = ({
  item,
  mergeBtn,
  splitBtn,
  setdatas,
  status,
}) => {
  return (
    <div className="cursor-pointer relative bg-white shadow-md rounded-t-lg rounded-b-md p-4 w-full max-w-sm mx-auto">
      {/*Merge Checkbox */}
      {mergeBtn && status !== "merged" && (
        <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full shadow-lg overflow-hidden bg-purple-200 flex justify-center items-center">
          <Checkbox
            id={item.nft[1]}
            className="border-black-100 border-2"
            onCheckedChange={(checked) => {
              // console.log(item.nft[0], checked);
              // console.log(datas);
              setdatas((prevDatas: any) => {
                const newDatas = [...prevDatas];
                newDatas[item.nft[1]].checked = checked;
                // console.log(newDatas);
                return newDatas;
              });
              return checked;
            }}
          />
        </div>
      )}
      {/* Split Checkbox */}
      {splitBtn && status == "merged" && (
        <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full shadow-lg overflow-hidden bg-yellow-200 flex justify-center items-center">
          <Checkbox
            id={item.nft[1]}
            className="border-black-100 border-2"
            // checked={item[3] ? item[3] : false}
            onCheckedChange={(checked) => {
              // console.log(item.nft[0], checked);
              // console.log(datas);
              setdatas((prevDatas: any) => {
                const newDatas = [...prevDatas];
                newDatas[item.nft[1]].checked = checked;
                // console.log(newDatas);
                return newDatas;
              });
              return checked;
            }}
          />
        </div>
      )}
      {/* Merged Logo */}
      {status == "merged" && (
        <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full shadow-lg overflow-hidden bg-black-100 flex justify-center items-center">
          <LuFileStack size={24} />
        </div>
      )}
      {/* Image Placeholder */}

      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
        <Image
          src={item.url}
          alt=""
          width={100}
          height={100}
          className="h-full w-full object-cover rounded-t-lg"
        />
      </div>

      {/* NFT Info */}
      <div className="mt-4 text-center">
        <h3 className="text-xl text-black-100 font-semibold">{item.name}</h3>
        <p className="text-md text-black-100">
          {item.nft[0].slice(0, 6)}...{item.nft[0].slice(-4)}
        </p>
        <p className="text-sm text-gray-500">idx：{item.nft[1]}</p>
        <p className="text-lg font-bold text-pink-500 mt-2">{item.nft[2]}%</p>
      </div>
    </div>
  );
};

"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Tabs } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/check-box";
import { useSubstrateContext } from "@/app/SubstrateProvider";
import { hexCodeToString } from "@/utils/util";
import { IoIosArrowDown } from "react-icons/io";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { FaRegCircleCheck } from "react-icons/fa6";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet-box";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { sendAndWait } from "@/utils/sendAndWait";
import { DataTableDemo } from "@/components/ui/data-table";
import ReactDOMServer from "react-dom/server";

const PAGE_SIZE = 15; // 每次加载的数据量

interface NFTDataProp {
  id: string; // 可能是 string 或 number 类型
  idx: number; // 索引，number 类型
  name: string; // 名称，string 类型
  url: string; // URL，string 类型
  desc: string; // 描述，string 类型
  owners: string[]; // owners 是一个字符串数组
  data: any;
}

interface BuyNFTDataProp {
  nft: string[]; // 可能是 string 或 number 类型
  price: number; // 索引，number 类型
  seller: string; // 名称，string 类型
  data: any;
  handleBuy: (info: any) => Promise<void>;
  settargetNFT: any;
  setopen: any;
}
export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};
const Browsing = () => {
  const [allDatas, setAllDatas] = useState<NFTDataProp[]>([]);
  const [visibleDatas, setVisibleDatas] = useState<NFTDataProp[]>([]); //All data
  const [buyDatas, setbuyAllDatas] = useState<BuyNFTDataProp[]>([]);
  const [visibleBuyDatas, setVisibleBuyDatas] = useState<BuyNFTDataProp[]>([]);
  const [tabs, settabs] = useState([] as any);
  const [ownedNFTsList, setownedNFTsList] = useState([]);
  const [targetNFT, settargetNFT] = useState([] as any); //目标nft
  const [offerNfts, setofferNfts] = useState([] as any);
  const [open, setopen] = useState<boolean>(false);
  const { toast } = useToast();

  const { api, allAccounts, injector, extensionEnabled, pending, setPending } =
    useSubstrateContext();

  useEffect(() => {
    fetchAllNfts();
    fetchBuyNfts();
  }, [api]); // 添加 api 作为依赖项
  // 获取所有buy nft

  interface NFTBuyType {
    url: string;
    nft: string[];
    seller: string;
    price: string;
    name: string;
    desc: string;
    owners: any; // 根据实际情况调整
    // 其他属性...
  }
  const fetchBuyNfts = async () => {
    if (!api) return; //
    // 查询所有BuyNFTs
    try {
      const entries = await api.query.nftMarketModule.listings.entries();
      // console.log("entries", entries);
      if (entries.length > 0) {
        const buyNFTs = entries.map(([key, value]) => ({
          nft: JSON.parse(JSON.stringify(key.args[0])),
          seller: JSON.parse(JSON.stringify(key.args[1])),
          price: Number(JSON.parse(JSON.stringify(value)).price) / 10 ** 12,
        }));
        // console.log("buy NFTs", buyNFTs);
        let newBuydatas: any = [];
        for (let i = 0; i < buyNFTs.length; i++) {
          let owners = await api.query.nftModule.nftOwners([
            buyNFTs[i].nft[0],
            buyNFTs[i].nft[1],
          ]);
          // 获取每一个集合的信息
          const nftInfo = await api.query.nftModule.nftCollections(
            buyNFTs[i].nft[0]
          );
          const [maxItem, curIndex, metainfo] = JSON.parse(
            JSON.stringify(nftInfo)
          );
          const nftMetaInfo = JSON.parse(hexCodeToString(metainfo).slice(1));
          //// console.log("nftMetaInfo", nftMetaInfo);

          const nft: NFTBuyType = {
            ...buyNFTs[i],
            url: nftMetaInfo.url,
            name: nftMetaInfo.name,
            desc: nftMetaInfo.desc,
            owners: JSON.parse(JSON.stringify(owners)),
          };
          // // console.log(nft);
          newBuydatas.push(nft);
        }
        // console.log("newBuydatas", newBuydatas);
        // 可买bft list
        setbuyAllDatas(newBuydatas);
        setVisibleBuyDatas(newBuydatas.slice(0, PAGE_SIZE)); // 初始化可见数据
      } else {
        // 获取每个nft的拥有者
        setbuyAllDatas([]);
        setVisibleBuyDatas([]); // 初始化可见数据z
      }
    } catch (error) {
      console.error("Error fetching collection IDs:", error);
    }
  };
  const fetchAllNfts = async () => {
    if (!api) return; // 如果 api 尚未初始化，直接返回
    // 查询所有NFTs
    try {
      const collectionIds = await api.query.nftModule.nftCollectionIds();
      // console.log(collectionIds);
      getAllNfts(collectionIds);
    } catch (error) {
      console.error("Error fetching collection IDs:", error);
    }
  };

  const getAllNfts = async (collectionIds: any) => {
    // 获取所有的集合
    const collectionIdsArray = JSON.parse(JSON.stringify(collectionIds));
    let datas: any = [];
    // // console.log("collectionIdsArray", collectionIdsArray);
    if (collectionIdsArray && collectionIdsArray.length > 0) {
      for (let i = 0; i < collectionIdsArray.length; ++i) {
        // 获取每一个集合的信息
        const collectionInfo = await api?.query.nftModule.nftCollections(
          collectionIdsArray[i]
        );
        const [maxItem, curIndex, metainfo] = JSON.parse(
          JSON.stringify(collectionInfo)
        );
        const collectionMetaInfo = JSON.parse(
          hexCodeToString(metainfo).slice(1)
        );

        for (let j = 0; j < curIndex; ++j) {
          const NFTData: any = {
            id: collectionIdsArray[i],
            // maxItem,
            // curIndex,
            idx: j,
            name: collectionMetaInfo.name,
            url: collectionMetaInfo.url,
            desc: collectionMetaInfo.desc,
          };
          datas.push(NFTData);
        }
      }
    }
    // console.log("all", datas);
    setAllDatas(datas);
    setVisibleDatas(datas.slice(0, PAGE_SIZE)); // 初始化可见数据
    getOwnedNFTArray();
  };
  const loadMoreData = () => {
    // console.log("loadMoreData");
    const currentVisibleCount = visibleDatas.length;
    if (currentVisibleCount >= allDatas.length) return;
    const nextDataCount = Math.min(
      PAGE_SIZE,
      allDatas.length - currentVisibleCount
    );
    const nextData = allDatas.slice(
      currentVisibleCount,
      currentVisibleCount + nextDataCount
    );
    setVisibleDatas((prev) => [...prev, ...nextData]);
  };
  const handleBuy = async (info: any) => {
    // console.log("买了买了", info);
    try {
      // console.log("pending", pending);
      setPending(true);
      // console.log(info.nft, info.seller);
      const tx = api?.tx.nftMarketModule.buyNft(info.nft, info.seller);
      // const connectedAccount = localStorage.getItem("connectedAccount");
      const connectedAccount = allAccounts[0];
      const hash = await sendAndWait(
        api,
        tx,
        connectedAccount,
        extensionEnabled,
        injector
      );
      // console.log(`buy hash: ${hash.toHex()}`);
      toast({
        title: (
          <div className="flex items-center">
            <FaRegCircleCheck
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            Buy Successful !!
          </div>
        ) as unknown as string,
        variant: "success",
      });

      fetchBuyNfts();
    } catch (error: any) {
      // console.log(`create error: ${error}`);
      toast({
        title: (<div className="flex items-center">{error}</div>) as unknown as string,
        // description: "Fail",
        variant: "destructive",
      });
    } finally {
      // console.log("pending", pending);
      setPending(false);
    }
  };
  const getOwnedNFTArray = async () => {
    // console.log("get owned nft list");
    //获取当前账户的nfts
    const connectedAccount = localStorage.getItem("connectedAccount");
    const bobOwnedNFTs = await api?.query.nftModule.ownedNFTs(connectedAccount);
    const bobOwnedNFTsArray = JSON.parse(JSON.stringify(bobOwnedNFTs));
    // console.log(bobOwnedNFTsArray);
    let ownedNFTArray: any = [];
    if (
      bobOwnedNFTsArray &&
      bobOwnedNFTsArray.length &&
      bobOwnedNFTsArray.length > 0
    ) {
      for (let i = 0; i < bobOwnedNFTsArray.length; i++) {
        // 获取每一个集合的信息
        const nftInfo = await api?.query.nftModule.nftCollections(
          bobOwnedNFTsArray[i][0]
        );
        const [maxItem, curIndex, metainfo] = JSON.parse(
          JSON.stringify(nftInfo)
        );
        const nftMetaInfo = JSON.parse(hexCodeToString(metainfo).slice(1));
        // // console.log("nftMetaInfo", nftMetaInfo);

        const nft = {
          nft: bobOwnedNFTsArray[i],
          url: nftMetaInfo.url,
          name: nftMetaInfo.name,
          desc: nftMetaInfo.desc,
        };
        ownedNFTArray.push(nft);
      }
      // console.log("ownedNFTArray", ownedNFTArray);
      setownedNFTsList(ownedNFTArray);
    }
  };
  useEffect(() => {
    // console.log("tabs");
    const tabs = [
      {
        title: "All",
        value: "All",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* 遍历所有类别下的 NFT */}
            {visibleDatas.map((itm) => (
              <DummyContent key={`${itm.id}-${itm.idx}`} {...itm} data={itm} />
            ))}
          </div>
        ),
      },
      {
        title: "Buy",
        value: "Buy",
        content: (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* 遍历 Art 类别下的 NFT */}
            {visibleBuyDatas.map((itm) => (
              <DummyContenBuy
                key={`${itm.nft[0]}-${itm.nft[1]}`}
                {...itm}
                data={itm}
                handleBuy={handleBuy}
                settargetNFT={settargetNFT}
                setopen={setopen}
              />
            ))}
          </div>
        ),
      },
    ];
    settabs(tabs);
  }, [visibleDatas, allDatas, visibleBuyDatas, buyDatas]);

  const selectSwapNFT = (ids: any, rows: any) => {
    // console.log("choose col");
    // console.log(rows);
    setofferNfts(rows);
  };

  const handleSwap = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // console.log("SWAP ----------");
    setPending(true);

    // FormData to Object
    const formData = new FormData(event.currentTarget);
    const formDataObject = Object.fromEntries(formData.entries());
    // console.log("表单数据对象:", formDataObject);
    //报价
    const swapToken = formDataObject.price;
    // console.log(targetNFT);
    // console.log("[Call] placeOffer");
    const swapLists = offerNfts.map((row: any) => row.nft);
    // console.log(swapLists);

    let tx = api?.tx.nftMarketModule.placeOffer(
      targetNFT.nft, // 目标NFT
      swapLists, // 用于报价的NFT数组
      swapToken, // 用于报价的token
      targetNFT.seller // 卖家
    );
    try {
      const currentAccount = allAccounts[0];

      let hash = await sendAndWait(
        api,
        tx,
        currentAccount,
        extensionEnabled,
        injector
      );
      // console.log(`offer hash: ${hash.toHex()}`);

      toast({
        title: (
          <div className="flex items-center">
            <FaRegCircleCheck
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            Offer Successful !!
          </div>
        ) as unknown as string,
        variant: "success",
      });
      fetchAllNfts();
      fetchBuyNfts();
    } catch (error: any) {
      // console.log(`offer error: ${error}`);
      toast({
        title:( <div className="flex items-center">{error}</div>) as unknown as string,
        description: "Fail",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden sm:px-10 px-5">
      <Header />
      <div className="max-w-[80%] w-full">
        <div className="h-[20rem] md:h-[40rem] [perspective:1000px] relative b flex flex-col max-w-5xl mx-auto w-full  items-start justify-start my-40">
          <div className="w-15 absolute right-0 z-20 custom-top flex max-w-sm items-center space-x-2 ">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Own
              </label>
            </div>
            <Input />
            <button className="px-4 py-2 rounded-md border border-white-300 uppercase bg-white text-black text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md">
              Search
            </button>
          </div>
          {tabs.length > 0 && <Tabs tabs={tabs} />}
          {visibleDatas.length < allDatas.length && allDatas.length > 0 && (
            // <button
            //   className="z-40 w-full p-2 bg-blue-500 text-white rounded cursor-pointer"
            // >
            //   Load More
            // </button>
            <div className="w-full flex justify-center">
              <button
                onClick={loadMoreData}
                className="relative w-30 h-10 bg-black text-white flex flex-col items-center justify-center border-none rounded-lg cursor-pointer p-3 gap-3 group"
              >
                <span className="w-full flex justify-center  items-center">
                  Load More
                  <IoIosArrowDown
                    size={20}
                    style={{ fill: "white", paddingTop: "2px" }}
                  />
                </span>
                <span className="absolute inset-0 left-[-4px] top-[-1px] m-auto w-[128px] h-[48px] rounded-[10px] bg-gradient-to-r from-[#e81cff] to-[#40c9ff] z-[-10] transition-all duration-600 ease-[cubic-bezier(0.175, 0.885, 0.32, 1.275)] group-hover:rotate-animation"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#fc00ff] to-[#00dbde] z-[-1] transition-all duration-300 transform scale-[0.95] blur-[20px] group-hover:blur-[30px]"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#fc00ff] to-[#00dbde] z-[-1] transition-all duration-300 transform scale-95 blur-20 group-active:scale-animation"></span>
              </button>
            </div>
          )}
        </div>

        <Sheet open={open} onOpenChange={setopen}>
          <SheetContent side="left" className="w-[50vw] bg-white">
            <SheetHeader>
              <SheetTitle>Submit Offer Form</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSwap}>
              <div className="grid gap-4 py-4 mt-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="price" className="text-right">
                    Price
                  </label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    defaultValue="@peduarte"
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="container mx-auto py-10">
                <DataTableDemo
                  data={ownedNFTsList}
                  selectedRow={selectSwapNFT}
                />
              </div>

              <div className="flex py-8 justify-center w-full">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md border font-semibold border-white-300 uppercase bg-purple-200 text-black text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md"
                >
                  Submit Offer
                </button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <Footer />
    </main>
  );
};

export default Browsing;

// 定义 DummyContent 组件的 props 类型
// type DummyContentProps = {
//   title: string;
//   creator: string;
//   price: string; // 价格可以是字符串或数字，取决于你的需求
// };
const DummyContent: React.FC<NFTDataProp> = ({
  data,
  id,
  idx,
  name,
  url,
  desc,
}) => {
  return (
    <div className="cursor-pointer bg-white shadow-md rounded-t-lg rounded-b-md p-4 w-full max-w-sm mx-auto">
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
        <Image
          src={url}
          alt="dummy image"
          width={100}
          height={100}
          className="h-full w-full object-cover rounded-t-lg"
        />
      </div>
      {/* NFT Info */}
      <div className="mt-4 text-center">
        <h3 className="text-xl text-black-100 font-semibold mb-2">{name}</h3>
        <p className="text-md text-black-100">
          {id.slice(0, 6)}...{id.slice(-4)}
        </p>
        <p className="text-sm text-gray-500">idx：{idx}</p>
        {/* <p className="text-lg font-bold text-pink-500 mt-2">{desc}</p> */}
      </div>
      <Link href={`/browsing/${id}/${idx}?data=${data}`}>
        <p className="mt-2 text-right cursor-pointer text-sm text-gray-400 ">
          详情
        </p>
      </Link>
    </div>
  );
};
const DummyContenBuy: React.FC<BuyNFTDataProp> = ({
  data,
  nft,
  price,
  seller,
  handleBuy,
  settargetNFT,
  setopen,
}) => {
  const currentAddress = localStorage.getItem("connectedAccount");
  return (
    <div className="cursor-pointer bg-white shadow-md rounded-t-lg rounded-b-md p-4 pb-2  w-full max-w-sm mx-auto">
      {/* Image Placeholder */}
      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
        <Image
          src={data.url}
          alt="dummy image"
          width={100}
          height={100}
          className="h-full w-full object-cover rounded-t-lg"
        />
      </div>
      {/* NFT Info */}
      <div className="mt-4 text-center">
        <h3 className="text-xl text-black-100 font-semibold mb-2">
          {data.name}
        </h3>
        <div className="flex justify-between">
          <p className="text-md text-black-100">
            {nft[0].slice(0, 6)}...{nft[0].slice(-4)}
          </p>
          <p className="text-sm text-gray-500">idx：{nft[1]}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-md text-pink-500 mt-2">share: {nft[2]}%</p>
          <p className="text-md font-bold text-pink-500 mt-2">{price} SNS</p>
        </div>
        <div className="text-sm text-gray-500 py-2 ">
          <AnimatedTooltip
            items={[
              {
                id: 1,
                name: "See Owners",
                designation: seller,
              },
            ]}
          />
        </div>
      </div>
      {seller === currentAddress ? (
        ""
      ) : (
        <div className="flex justify-between pt-2 -mx-2">
          <Button
            variant="secondary"
            onClick={() => {
              handleBuy({ nft: nft, seller });
            }}
          >
            Buy
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setopen(true);
              settargetNFT(data);
            }}
          >
            Swap
          </Button>
        </div>
      )}
    </div>
  );
};

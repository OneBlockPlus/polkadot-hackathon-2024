"use client";
import Image from "next/image";
import { Tabs } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/check-box";
import { FormEvent, useEffect, useState } from "react";
import { useSubstrateContext } from "@/app/SubstrateProvider";
import { FiEdit } from "react-icons/fi";
import { useToast } from "@/hooks/use-toast";
import { sendAndWait } from "@/utils/sendAndWait";
import { Button } from "@/components/ui/button";
import { BiSolidMessageSquareDetail } from "react-icons/bi";
import { RiErrorWarningLine } from "react-icons/ri";
import ReactDOMServer from "react-dom/server";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaRegCircleCheck } from "react-icons/fa6";
import { LuFileStack } from "react-icons/lu";
import { hexCodeToString } from "@/utils/util";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet-box";

import Footer from "@/components/Footer";

const UserCenter = () => {
  const [open, setOpen] = useState(false);
  const [datas, setdatas] = useState([]);
  const [pubItem, setpubItem] = useState([] as any);
  const [offerCounts, setofferCounts] = useState(0);
  const [offerList, setofferList] = useState([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [shareMes, setshareMes] = useState(0); // share 默认值为 0
  const { toast } = useToast();
  const { api, allAccounts, injector, extensionEnabled, pending, setPending } =
    useSubstrateContext();

  useEffect(() => {
    fetchUserNFTs();
  }, [api]);

  const fetchUserNFTs = async () => {
    if (!api) return; // 如果 api 尚未初始化，直接返回

    try {
      // console.log("[Query] ownedNFTs");
      const connectedAccount = localStorage.getItem("connectedAccount");

      // 当前账号的上架 list
      const entries = await api.query.nftMarketModule.listings.entries();
      const publishedNFTs = entries
        .filter(([key]) => key.args[1].eq(connectedAccount))
        .map(([key, value]) => ({
          nft: JSON.parse(JSON.stringify(key.args[0])),
          seller: JSON.parse(JSON.stringify(key.args[1])),
          price: JSON.parse(JSON.stringify(value)).price,
        }));
      // console.log("publishedNFTs", publishedNFTs);

      const ownedNFTs: any = await api.query.nftModule.ownedNFTs(
        connectedAccount
      );
      const datas = JSON.parse(ownedNFTs);
      // console.log("ownedNFTs", datas);

      // 当前账号的上架 list
      const ownedNFTsArray: any = await Promise.all(
        datas.map(async (i: any) => {
          let status = await getNftConsolidateStatus(i[0], i[1]);
          // 检查 publishedNFTs 中是否存在匹配的对象
          const matchingItem = publishedNFTs.find(
            (item) => item.nft[0] === i[0] && item.nft[1] === i[1]
          );
          // console.log("是否上架", matchingItem);
          // 获取每一个集合的信息
          const nftInfo = await api.query.nftModule.nftCollections(i[0]);
          const [maxItem, curIndex, metainfo] = JSON.parse(
            JSON.stringify(nftInfo)
          );
          const nftMetaInfo = JSON.parse(hexCodeToString(metainfo).slice(1));
          // // console.log("nftMetaInfo", nftMetaInfo);
          return {
            nft: i,
            url: nftMetaInfo.url,
            name: nftMetaInfo.name,
            desc: nftMetaInfo.desc,
            status: status,
            ...(matchingItem
              ? { price: matchingItem.price, share: matchingItem.nft[2] }
              : {}),
          };
        })
      );
      // console.log("Fetched Data:", ownedNFTsArray);
      setdatas(ownedNFTsArray);
    } catch (error) {
      console.error("Error fetching collection IDs:", error);
    }

    // 收到的所有offer
    getOfferList();
  };
  const getOfferList = async () => {
    // console.log("[Query] alice offers");
    // 收到的所有offer
    const connectedAccount = localStorage.getItem("connectedAccount");
    const offersList = await getAccountAllOffers(api, connectedAccount);
    // console.log("收到的所有offer", offersList);
    setofferList(offersList);
    setofferCounts(offersList.length);
  };
  const getNftConsolidateStatus = async (
    collectionId,
    itemIndex
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
      // // console.log("general nft");
    } else {
      status = "sub"; // 该nft已被merge，当前不可用
      // // console.log("sub(frozen) nft");
    }
    return status;
  };

  const getAccountAllOffers = async (api, accountAddress) => {
    const entries = await api.query.nftMarketModule.offers.entries();
    const offersForAccount: any = [];
    for (const [key, value] of entries) {
      // 获取每一个集合的信息
      const nftInfo = await api.query.nftModule.nftCollections(
        JSON.parse(JSON.stringify(key.args[0]))[0]
      ); // 使用 key.args[0] 作为参数
      const [maxItem, curIndex, metainfo] = JSON.parse(JSON.stringify(nftInfo));
      const nftMetaInfo = JSON.parse(hexCodeToString(metainfo).slice(1));

      if (key.args[1].eq(accountAddress)) {
        offersForAccount.push({
          nft: JSON.parse(JSON.stringify(key.args[0])),
          offers: JSON.parse(JSON.stringify(value)),
          url: nftMetaInfo.url,
          name: nftMetaInfo.name,
        });
      }
    }

    // .map(([key, value]) => ({
    //   nft: JSON.parse(JSON.stringify(key.args[0])),
    //   offers: JSON.parse(JSON.stringify(value)),
    // }));
    return offersForAccount;
  };

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // console.log(pubItem);

    // console.log("上架");
    const formData = new FormData(event.currentTarget);
    const formDataObject = Object.fromEntries(formData.entries());
    // console.log("表单数据对象:", formDataObject);

    const shareRate = Number(formDataObject.share);
    const price = Number(formDataObject.price) * 10 ** 12;
    const param1 = [pubItem.nft[0], Number(pubItem.nft[1]), shareRate];
    // console.log(param1);
    // console.log(price);
    // 上架
    try {
      // console.log("pending", pending);
      setPending(true);
      //当前账户
      const currentAccount = allAccounts[0];
      //tx
      const tx = api?.tx.nftMarketModule.listNft(param1, price);
      //hash
      const hash = await sendAndWait(
        api,
        tx,
        currentAccount,
        extensionEnabled,
        injector
      );
      // console.log(`publish hash: ${hash.toHex()}`);
      toast({
        title: (
          <div className="flex items-center">
            <FaRegCircleCheck
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            List of sale Successful !!
          </div>
        ) as unknown as string,
        variant: "success",
      });
      //刷新数据 NFT 集合
      fetchUserNFTs();
    } catch (error: any) {
      // console.log(`create error: ${error}`);
      toast({
        title: (
          <div className="flex items-center">{error}</div>
        ) as unknown as string,
        // description: "Fail",
        variant: "destructive",
      });
    } finally {
      setOpen(false);
      setPending(false);
    }
  };

  const handleOffer = async (target, idx) => {
    // console.log("[Call] acceptOffer");
    // console.log(target, idx);

    let tx = api?.tx.nftMarketModule.acceptOffer(
      target.nft, // 目标NFT
      target.offers[idx].offeredNfts, // 用于报价的NFT数组
      target.offers[idx].tokenAmount, // 用于报价的token
      target.offers[idx].buyer // 买家
    );
    try {
      setPending(true);
      const currentAccount = allAccounts[0];
      let hash: any = await sendAndWait(
        api,
        tx,
        currentAccount,
        extensionEnabled,
        injector
      );
      // console.log(`accept hash: ${hash.toHex()}`);
      toast({
        title: (
          <div className="flex items-center">
            <FaRegCircleCheck
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            Successful!
          </div>
        ) as unknown as string,
        description: hash.toHex(),
        variant: "success",
      });
      setPending(false);
    } catch (error: any) {
      // console.log(`accept error: ${error}`);
      setPending(true);
      toast({
        title: (
          <div className="flex items-center">{error}</div>
        ) as unknown as string,
        description: "Fail",
        variant: "destructive",
      });
    } finally {
      setPending(false);
      setIsSheetOpen(false);
    }
  };
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden sm:px-10 px-5">
      <Header />
      <div className="max-w-[80%] w-full  relative  flex flex-col mt-40  items-start justify-start">
        <div className="absolute left-0 z-20 flex items-center space-x-2">
          <Button
            className="relative"
            onClick={() => {
              setIsSheetOpen(true);
            }}
          >
            Offer
            {offerCounts ? (
              <div className="absolute inline-flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900"></div>
            ) : (
              ""
            )}
          </Button>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side="right" className="w-[80vw] bg-white">
              <SheetHeader>
                <SheetTitle>Offer List</SheetTitle>
                <SheetDescription>confirm offer </SheetDescription>
              </SheetHeader>
              <div
                className="overflow-y-scroll"
                style={{ height: "calc(100vh + 80vh)" }}
              >
                <ul role="list" className="divide-y divide-gray-100">
                  {offerList.map((itm, idx) => (
                    <ListBox item={itm} key={idx} handleOffer={handleOffer} />
                  ))}
                </ul>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* 遍历 Art 类别下的 NFT */}
          {datas
            .filter((item: any) => item.status !== "sub") // 先过滤掉状态为 "sub" 的项目
            .map((item, idx) => (
              <DummyContent
                key={`${item[0]}-${idx}`}
                item={item}
                nftInfo={(item as { nft: string[] }).nft}
                status={(item as { status: string }).status}
                handlePublish={handlePublish}
                open={open}
                setOpen={setOpen}
                setpubItem={setpubItem}
                setshareMes={setshareMes}
                shareMes={shareMes}
              />
            ))}
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default UserCenter;

// 定义 DummyContent 组件的 props 类型
type DummyContentProps = {
  item: any;
  nftInfo: string[];
  status: string;
  handlePublish: (event: FormEvent<HTMLFormElement>) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  setpubItem: (open: boolean) => void;
  shareMes: any;
  setshareMes: (open: number) => void;
};
const DummyContent: React.FC<DummyContentProps> = ({
  item,
  nftInfo,
  handlePublish,
  open,
  setOpen,
  setpubItem,
  shareMes,
  setshareMes,
}) => {
  const { toast } = useToast();
  return (
    <div className=" cursor-pointer relative bg-white shadow-md rounded-t-lg rounded-b-md p-4 pb-2 w-full max-w-sm mx-auto">
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
          {nftInfo[0].slice(0, 6)}...{nftInfo[0].slice(-4)}
        </p>
        <p className="text-sm text-gray-500">idx：{nftInfo[1]}</p>
        <p className="text-lg font-bold text-pink-500 mt-2">
          {nftInfo[2]}%
          <span className="text-sm font-normal text-pink-300 ml-2">
            {item.share ? `(${item.share}%)` : ""}
          </span>
        </p>
        <div className="flex justify-between items-center  -mx-2">
          <Dialog open={open} onOpenChange={setOpen}>
            {item.share ? (
              <div className="w-full flex justify-between pt-2">
                <Button variant="outline" size="sm">
                  Unlist
                </Button>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    Update
                  </Button>
                </DialogTrigger>
              </div>
            ) : (
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setpubItem(item);
                    setshareMes(item.nft[2]);
                    // console.log("publish", item);
                  }}
                >
                  List of sale
                </Button>
              </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle> List of sale Form</DialogTitle>
                <DialogDescription>Enter share and price.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePublish}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="share" className="text-right text-black">
                      Share(%)
                    </label>
                    <Input
                      id="share"
                      name="share"
                      type="number"
                      value={shareMes}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 0 && value <= 100) {
                          // 检查范围
                          setshareMes(value);
                        } else {
                          toast({
                            title: (
                              <div className="flex items-center">
                                <RiErrorWarningLine
                                  size={50}
                                  style={{ fill: "white", marginRight: "2rem" }}
                                />
                                Value must be between 0 and 100
                              </div>
                            ) as unknown as string,
                            variant: "warning",
                          });
                          // 如果不在范围内，可以选择不更新状态或给出提示
                          console.warn("Value must be between 0 and 100");
                        }
                      }} // 处理输入变化
                      className="col-span-3 w-[150px]"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="price" className="text-right text-black">
                      Price(SNS)
                    </label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      className="col-span-3 w-[150px]"
                      step="0.01"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" variant="dark">
                    Submit
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
const ListBox = ({ item, handleOffer }) => {
  return (
    <li>
      <div className="flex justify-between gap-x-6 py-5">
        <div className="flex gap-x-4 w-full">
          <Image
            className="h-12 w-12 flex-none rounded-full bg-gray-50"
            src={item.url}
            alt=""
            width={48}
            height={48}
          />
          <div className="w-full flex-auto">
            <div className="flex w-full gap-8 border-b-2 border-white">
              <p className="text-lg font-semibold leading-6 text-gray-200">
                {item.name}
              </p>
              <p className="text-sm leading-6 text-gray-200">
                Address:{" "}
                <span className="text-sm pl-2 text-purple-300  font-semibold">
                  {item.nft[0].slice(0, 6)}...{item.nft[0].slice(-4)}
                </span>
              </p>
              <p className="text-sm  leading-6 text-gray-200">
                IDX:{" "}
                <span className="text-sm pl-2 text-purple-300  font-semibold">
                  {item.nft[1]}
                </span>
              </p>
              <p className="text-sm  leading-6 text-gray-200">
                Share:{" "}
                <span className="text-sm pl-2 text-purple-300  font-semibold">
                  {item.nft[2]}
                </span>
              </p>
            </div>
            <p className="mt-1 truncate text-xs leading-5 text-gray-200">
              offers num:
              <span className="px-2  font-semibold  text-lg text-red-400">
                {item.offers.length}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="pl-8">
        {item.offers.map((itm, idx) => {
          return (
            <div key={`offer-${itm.buyer}`}>
              <div className="min-w-0 flex-auto flex justify-between">
                <p className="text-5 font-semibold leading-6 text-gray-200">
                  <span className="pr-2">{idx + 1}.</span> Buyer:{" "}
                  <span className="text-purple-300">
                    {itm.buyer.slice(0, 6)}...{itm.buyer.slice(-4)}
                  </span>
                </p>
                <p className="mt-1 truncate  font-semibold  leading-5 text-gray-200">
                  tokenAmount:{" "}
                  <span className="text-purple-300  font-semibold">
                    {itm.tokenAmount}
                  </span>
                </p>
                <div className="flex justify-between">
                  <Button
                    onClick={() => {
                      handleOffer(item, idx);
                    }}
                    className="px-2 py-2 rounded-md  bg-purple-300 text-black "
                  >
                    Accept
                  </Button>
                  <Button
                    className="ml-2"
                    onClick={() => {
                      // console.log("reject");
                    }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
              {itm.offeredNfts.map((offItm, idx) => (
                <div
                  className="pl-6 min-w-0 flex-auto flex gap-4 "
                  key={`offer-${idx}`}
                >
                  <BiSolidMessageSquareDetail size={30} />
                  <p className="mt-1 truncate  font-semibold  leading-5 text-gray-200">
                    address:
                    <span className="pl-2 text-purple-300  font-semibold">
                      {offItm[0].slice(0, 6)}...
                      {offItm[0].slice(-4)}
                    </span>
                  </p>

                  <p className="mt-1 truncate  font-semibold  leading-5 text-gray-200">
                    id:
                    <span className="pl-2 text-purple-300  font-semibold">
                      {offItm[1]}
                    </span>
                  </p>
                  <p className="mt-1 truncate  font-semibold  leading-5 text-gray-200">
                    Share:
                    <span className="pl-2 text-purple-300  font-semibold">
                      {offItm[2]}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </li>
  );
};

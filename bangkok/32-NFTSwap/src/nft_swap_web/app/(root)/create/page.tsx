"use client";
import React, { useState, FormEvent, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useSubstrateContext } from "@/app/SubstrateProvider";
import {
  web3Enable,
  web3Accounts,
  web3FromAddress,
} from "@polkadot/extension-dapp";
import { sendAndWait } from "@/utils/sendAndWait";

import Header from "@/components/Header";
import Image from "next/image";
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
import { Input } from "@/components/ui/input";

import { useToast } from "@/hooks/use-toast";
import { FaRegCircleCheck } from "react-icons/fa6";
import { RiErrorWarningLine } from "react-icons/ri";
import { hexCodeToString } from "@/utils/util";
import Footer from "@/components/Footer";
import ReactDOMServer from "react-dom/server";

interface CollectionData {
  maxItem: number;
  curIndex: number;
  name: string;
  url: string;
  desc: string;
}
const Create = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [allDatas, setAllDatas] = useState<CollectionData[]>([]);
  const { api, allAccounts, injector, extensionEnabled, pending, setPending } =
    useSubstrateContext();

  const { toast } = useToast();
  useEffect(() => {
    const fetchCollectionIds = async () => {
      if (!api) return; // 如果 api 尚未初始化，直接返回
      try {
        // console.log(api);
        // 查询现有的 NFT 集合
        const collectionIds = await api.query.nftModule.nftCollectionIds();
        getInfo(collectionIds);
      } catch (error) {
        console.error("Error fetching collection IDs:", error);
      }
    };

    fetchCollectionIds();
  }, [api]); // 添加 api 作为依赖项

  // 处理获取集合列表
  const getInfo = async (collectionIds: any) => {
    const collectionIdsArray = JSON.parse(JSON.stringify(collectionIds));
    if (collectionIdsArray) {
      // console.log("[Query] nftCollections");
      const fetchedDatas = await Promise.all(
        collectionIdsArray.map(async (id: any) => {
          const collectionInfo = await api?.query.nftModule.nftCollections(id);
          const [maxItem, curIndex, metainfo] = JSON.parse(
            JSON.stringify(collectionInfo)
          );
          const collectionMetaInfo = JSON.parse(
            hexCodeToString(metainfo).slice(1)
          );
          return {
            id,
            maxItem,
            curIndex,
            name: collectionMetaInfo.name,
            url: collectionMetaInfo.url,
            desc: collectionMetaInfo.desc,
          };
        })
      );

      // console.log(fetchedDatas);
      setAllDatas(fetchedDatas);
    }
    // return allDatas; // 返回包含所有 datas 的数组
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // console.log("点击创建");
    // console.log("api", api);
    if (!api) {
      alert("请关联账户");
      return;
    }

    setPending(true);
    // console.log(event);
    const formData = new FormData(event.currentTarget);
    // console.log("formData", formData);
    // FormData to Object
    const formDataObject = Object.fromEntries(formData.entries());
    // console.log("表单数据对象:", formDataObject);

    // 创建 NFT 集合
    // console.log("[Call] createCollection");
    const tx = api.tx.nftModule.createCollection(
      formDataObject.maxnum,
      JSON.stringify({
        name: formDataObject.collectionName,
        url: formDataObject.imgLink,
        desc: formDataObject.desc,
      })
    );
    //当前账户
    const currentAccount = allAccounts[0];
    // console.log(currentAccount);

    try {
      //// 测试数据
      //const keyring = new Keyring({ type: "sr25519" });
      //const ass = [keyring.addFromUri("//Alice"), keyring.addFromUri("//Bob")];
      //const [alice, bob] = ass;
      //// console.log(alice);
      // console.log("pending", pending);
      setPending(true);
      const hash = await sendAndWait(
        api,
        tx,
        currentAccount,
        extensionEnabled,
        injector
      );
      // console.log(`create hash: ${hash.toHex()}`);
      // 查询现有的 NFT 集合
      // console.log("[Query] nftCollectionIds");
      const collectionIds = await api.query.nftModule.nftCollectionIds();
      // console.log(`collection ids: ${collectionIds}`);
      getInfo(collectionIds);
      toast({
        title: (
          <div className="flex items-center">
            <FaRegCircleCheck
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            Create Successful !!
          </div>
        ) as unknown as string,
        variant: "success",
      });
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
      // console.log("pending", pending);
      setIsSheetOpen(false);
      setPending(false);
    }
  };
  const handleMint = async (id: any) => {
    // console.log("[Call] mintNft");
    setPending(true);
    // console.log(id);
    let tx = api?.tx.nftModule.mintNft(id, 0x0);
    //hash = await tx.signAndSend(alice);
    //delay(10000); // 等待mint完成
    const currentAccount = allAccounts[0];
    // console.log("currentAccount", currentAccount);
    try {
      let hash = await sendAndWait(
        api,
        tx,
        currentAccount,
        extensionEnabled,
        injector
      );
      // console.log(`create hash: ${hash.toHex()}`);
      // 查询现有的 NFT 集合
      // console.log("[Query] nftCollectionIds");
      const collectionIds = await api?.query.nftModule.nftCollectionIds();
      // console.log(`collection ids: ${collectionIds}`);
      getInfo(collectionIds);

      toast({
        title: (
          <div className="flex items-center">
            <FaRegCircleCheck
              size={50}
              style={{ fill: "white", marginRight: "2rem" }}
            />
            Mint Successful !!
          </div>
        ) as unknown as string,
        variant: "success",
      });
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
      setPending(false);
    }
  };
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden sm:px-10 px-5">
      <Header />
      <div className="max-w-[80%] w-full mt-10 h-[80vh]">
        <div className="w-15 relative  flex max-w-sm items-center space-x-2 my-20">
          <button
            onClick={() => {
              // // console.log("点击创建");
              if (!api) {
                toast({
                  title: (
                    <div className="flex items-center">
                      <RiErrorWarningLine
                        size={50}
                        style={{ fill: "white", marginRight: "2rem" }}
                      />
                      Please connect your accounts
                    </div>
                  ) as unknown as string,
                  variant: "warning",
                });
                return;
              } else {
                // console.log("api", api);
                setIsSheetOpen(true);
              }
            }}
            className="px-4 py-2 rounded-md border font-semibold border-white-300 uppercase bg-purple-200 text-black transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            Add Collection
          </button>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent
              side="left"
              className="w-[480px] sm:w-[540px] bg-white"
            >
              <SheetHeader>
                <SheetTitle>Create NFT Collection</SheetTitle>
                <SheetDescription>Make a NFT Collection</SheetDescription>
              </SheetHeader>
              <form onSubmit={handleCreate}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="collectionName" className="text-right">
                      Name
                    </label>
                    <Input
                      id="collectionName"
                      name="collectionName"
                      type="text"
                      placeholder="Collection name"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="imgLink" className="text-right">
                      Img-Link
                    </label>
                    <Input
                      id="imgLink"
                      name="imgLink"
                      type="text"
                      className="col-span-3"
                      placeholder="image link"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="maxnum" className="text-right">
                      MaxNum
                    </label>
                    <Input
                      id="maxnum"
                      name="maxnum"
                      type="number"
                      className="col-span-3"
                      placeholder="max num"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="desc" className="text-right">
                      Desc
                    </label>
                    <Textarea
                      id="desc"
                      name="desc"
                      className="col-span-3"
                      placeholder="Type your desc here."
                    />
                  </div>
                </div>
                <div className="flex py-8 justify-center w-full">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-md border font-semibold border-white-300 uppercase bg-purple-200 text-black text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md"
                  >
                    Create
                  </button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </div>
        <ul role="list" className="divide-y divide-gray-100">
          {allDatas.map((itm, idx) => (
            <ListBox item={itm} key={idx} handleMint={handleMint} />
          ))}
        </ul>
      </div>
      <Footer />
    </main>
  );
};

export default Create;

const ListBox = ({ item, handleMint }: { item: any; handleMint: any }) => {
  const { toast } = useToast();
  return (
    <li className="flex justify-between gap-x-6 py-5">
      <div className="flex gap-x-4">
        <Image
          className="h-12 w-12 flex-none rounded-full bg-gray-50"
          src={item.url}
          alt=""
          width={48}
          height={48}
        />
        <div className="min-w-0 flex-auto">
          <p className="text-5 font-semibold leading-6 text-gray-200">
            {item.name}
          </p>
          <p className="mt-1 truncate text-xs leading-5 text-gray-500">
            {item.desc}
          </p>
        </div>
      </div>
      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
        {/* <p className="text-sm leading-6 text-gray-200">Co-Founder / CEO</p> */}
        {/* <p className="mt-1 text-xs leading-5 text-gray-500">Last seen</p> */}
        <button
          onClick={() => {
            if (item.curIndex + 1 > item.maxItem) {
              toast({
                title: (
                  <div className="flex items-center">
                    <RiErrorWarningLine
                      size={50}
                      style={{ fill: "white", marginRight: "2rem" }}
                    />
                    The maximum number of mints is exceeded
                  </div>
                ) as unknown as string,
                variant: "warning",
              });
            } else handleMint(item.id);
          }}
          className="px-2 py-2 rounded-md border border-white-100 font-medium bg-purple-200 text-black text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md"
        >
          mint{" "}
          <span className="text-purple-900 font-semibold ">
            ({item.curIndex}/{item.maxItem})
          </span>
        </button>
      </div>
    </li>
  );
};

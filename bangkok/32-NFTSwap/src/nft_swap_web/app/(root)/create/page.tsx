"use client";
import React, { useState, FormEvent } from "react";
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
import { Keyring } from "@polkadot/api";

const listMap = [
  {
    title: "title1",
    img: "https://app.nftmart.io/static/media/007.16d68919.png",
    desc: "desc",
    num: 5,
  },
  {
    title: "title2",
    img: "https://app.nftmart.io/static/media/007.16d68919.png",
    desc: "desc",
    num: 5,
  },
  {
    title: "title3",
    img: "https://app.nftmart.io/static/media/007.16d68919.png",
    desc: "desc",
    num: 5,
  },
];

const Create = () => {
  const [loading, setLoading] = useState(false);
  const { api, allAccounts, injector, extensionEnabled, setPending } =
    useSubstrateContext();
  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("点击创建");
    console.log("api", api);
    if (!api) {
      alert("请关联账户");
      return;
    }

    setLoading(true);
    console.log(event);
    const formData = new FormData(event.currentTarget);
    console.log("formData", formData);
    // FormData to Object
    const formDataObject = Object.fromEntries(formData.entries());
    console.log("表单数据对象:", formDataObject);
    // const response = await fetch('/api/api_create', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(formDataObject), // 将对象转换为 JSON 字符串
    // });
    // const data = await response.json();
    // console.log(data);

    // 创建 NFT 集合
    console.log("[Call] createCollection");
    const tx = api.tx.nftModule.createCollection(
      formDataObject.maxnum,
      formDataObject.collectionName
    );
    //当前账户
    const currentAccount = allAccounts[0];
    console.log(currentAccount);
    try {
      // 测试数据
      const keyring = new Keyring({ type: "sr25519" });
      const ass = [keyring.addFromUri("//Alice"), keyring.addFromUri("//Bob")];
      const [alice, bob] = ass;
      console.log(alice);

      const hash = await sendAndWait(api, tx, alice, false, undefined);
      //const hash = await sendAndWait(
      //  api,
      //  tx,
      //  currentAccount,
      //  extensionEnabled,
      //  injector
      //);
      console.log(`create hash: ${hash.toHex()}`);
    } catch (error) {
      console.log(`create error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden sm:px-10 px-5">
      <Header />
      <div className="max-w-[80%] w-full">
        <div className="w-15 relative  flex max-w-sm items-center space-x-2 my-20">
          <Sheet>
            <SheetTrigger asChild>
              <button className="px-4 py-2 rounded-md border font-semibold border-white-300 uppercase bg-purple-200 text-black text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md">
                Add Collection
              </button>
            </SheetTrigger>
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
                <SheetFooter>
                  <SheetClose asChild>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md border font-semibold border-white-300 uppercase bg-purple-200 text-black text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md"
                      disabled={loading}
                    >
                      Create
                    </button>
                  </SheetClose>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </div>
        <ul role="list" className="divide-y divide-gray-100">
          {listMap.map((itm, idx) => (
            <ListBox item={itm} key={idx} />
          ))}
        </ul>
      </div>
    </main>
  );
};

export default Create;

const ListBox = ({ item }) => {
  return (
    <li className="flex justify-between gap-x-6 py-5">
      <div className="flex gap-x-4">
        <Image
          className="h-12 w-12 flex-none rounded-full bg-gray-50"
          src={item.img}
          alt=""
          width={48}
          height={48}
        />
        <div className="min-w-0 flex-auto">
          <p className="text-5 font-semibold leading-6 text-gray-200">
            {item.title}
          </p>
          <p className="mt-1 truncate text-xs leading-5 text-gray-500">
            {item.desc}
          </p>
        </div>
      </div>
      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
        {/* <p className="text-sm leading-6 text-gray-200">Co-Founder / CEO</p> */}
        {/* <p className="mt-1 text-xs leading-5 text-gray-500">Last seen</p> */}
        <button className="px-2 py-2 rounded-md border border-white-100 font-medium bg-purple-200 text-black text- hover:-translate-y-1 transform transition duration-200 hover:shadow-md">
          mint{" "}
          <span className="text-purple-900 font-semibold">({item.num})</span>
        </button>
      </div>
    </li>
  );
};

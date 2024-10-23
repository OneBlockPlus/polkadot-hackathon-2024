"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import CatImg from "@/public/new/cat.png"
import ChatBox from "@/public/new/chat-box.png"
import ButtonImg from "@/public/new/button-star.png"
import animation1 from "@/public/Animation/AnimationFire.json"
import LottieAnimation from "@/app/ui/component/LottieAnimation";
import { GearApi } from "@gear-js/api";
import Connected from "@/app/ui/component/Connected";
import { Program } from "@/app/lib";

const VNFT_PROGRAM_ID =
  "0xbb164a2a6f53a17cf06624621a7d94d41526e3806616332a02ccfe4d90d69ed8";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [ques, setques] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [card, setCard] = useState("");
  const [cardNumber, setCardNumber] = useState(0);
  const [gearApi, setGearApi] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isConnected, setConnected] = useState(false);

  const handleDrawCardAndFetchreading = async (description: string) => {
    setLoading(true);

    try {
      if (!gearApi || !selectedAccount) {
        throw new Error("Gear API or selected account not available");
      }

      const program = new Program(gearApi, VNFT_PROGRAM_ID);
      const result = await program.vnft.drawCard(selectedAccount.address);
      const output = result.split('; ');

      const card = output[0].split(' ')[0];
  
      setCard(card);
      const position = output[1];

      const requestBody = {
        model: "gpt-4-turbo",
        messages: [
          {
            role: "user",
            content: `You are a Major Arcana Tarot reader. Client asks this question "${description}" and draws the "${card}" card in "${position}" position. Interpret to the client in no more than 100 words.`,
          },
        ],
      };
      let apiKey = process.env.NEXT_PUBLIC_API_KEY;
      if (!apiKey) {
        console.error('API key is not set. Make sure NEXT_PUBLIC_API_KEY is defined in your .env.local file.');
        throw new Error('API key is not set');
      }
      const baseURL = "https://api.openai.com/v1/chat/completions";
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Accept", "application/json");
      headers.append(
        "Authorization",
        `Bearer ${apiKey}`
      );
      const readingResponse = await fetch(baseURL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      const readingData = await readingResponse.json();
      const reading = readingData.choices[0].message.content;
      setLyrics(reading);

      if (!readingResponse.ok) {
        console.error('API request failed:', await readingResponse.text());
        throw new Error('Failed to get reading from API');
      }

      if (!readingResponse.ok) {
        throw new Error("Failed to fetch reading");
      }

    } catch (error) {
      console.error("Error handling draw card and fetching reading:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const connectToGearApi = async () => {
        try {
          const api = await GearApi.create({
            providerAddress: "wss://testnet.vara.network",
          });
          setGearApi(api);
          console.log("Connected to Vara testnet");
        } catch (error) {
          console.error("Failed to connect to Gear API:", error);
        }
      };

      connectToGearApi();
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === 'undefined') {
      console.log("Window object is not available");
      return;
    }

    try {
      const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
      
      const extensions = await web3Enable("My Gear App");
      if (extensions.length === 0) {
        console.log("No extension found");
        return;
      }

      const allAccounts = await web3Accounts();
      setAccounts(allAccounts);

      if (allAccounts.length > 0) {
        setSelectedAccount(allAccounts[0]);
        setConnected(true);
        console.log("Wallet connected:", allAccounts[0].address);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const mintExample = async (description: string) => {
    const { web3FromSource } = await import('@polkadot/extension-dapp');

    const to =
      "0x726db3a23fc98b838572bfcc641776dd9f510071f400d77fac526266c0fcdca7";
      
    const token_metadata = {
      name: card,
      description: description,
      media: `ipfs://bafybeigtyace3x4a65spsaaagbhsbanq5qgntk5pqpdum67gvaqp4cj5uy/${cardNumber}.png`,
      reference:lyrics ,
    };
    const vnft = new Program(gearApi, VNFT_PROGRAM_ID);
    const transaction = vnft.vnft.mint(to, token_metadata);
    const injector = await web3FromSource(selectedAccount.meta.source);
    transaction.withAccount(selectedAccount.address, {
      signer: injector.signer,
    });
    await transaction.calculateGas();
    const { msgId, blockHash, response } = await transaction.signAndSend();
    await response();
    console.log("VNFT minted successfully");
  };

  const handleAccountChange = (event: any) => {
    const account = accounts.find((acc: any) => acc.address === event.target.value);
    setSelectedAccount(account);
  };


  return (
    <main
      className={`flex h-screen flex-col items-center justify-between w-full relative ${lyrics && ques ? 'py-40' : 'py-60'} overflow-hidden` }
      style={{
        backgroundImage: (isConnected)
            ? "url(/web_bg.png)"
            : "url(/web_bg.png)",
        backgroundPosition: "center",
        backgroundSize: "cover",
        position: "relative",
        zIndex: 0,
      }}
    >
      <div className="absolute top-[35.8%] left-[73.4%] w-16 h-16">
        <LottieAnimation animationData={animation1} speed={1} />
      </div>
      <div className="absolute top-[45.2%] left-[24.0%] w-14 h-14">
        <LottieAnimation animationData={animation1} speed={0.75} />
      </div>
      <div className="absolute top-[45.2%] left-[26.0%] w-14 h-14">
        <LottieAnimation animationData={animation1} speed={1.25} />
      </div>

      <div
        className="z-10 lg:max-w-7xl w-full justify-between font-mono text-sm lg:flex md:flex"
        style={{
          position: "absolute",
          top: 30,
        }}
      >
        <p
          className="text-white text-2xl backdrop-blur-2xl dark:border-neutral-800 dark:from-inherit rounded-xl"
          style={{ fontFamily: 'fantasy' }}
        >
        </p>
        <div>
          {isConnected ? (
            <>
              {accounts.length > 0 && (
                <div className="mb-4">
                  <label
                    htmlFor="account-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Select Account
                  </label>
                  <select
                    id="account-select"
                    onChange={handleAccountChange}
                    value={selectedAccount?.address || ""}
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {accounts.map((account: any) => (
                      <option key={account.address} value={account.address}>
                        {account.meta.name || account.address}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {selectedAccount && (
                <p className="text-sm text-white">
                  Connected Account:{" "}
                  <span className="font-semibold text-white">
                    {selectedAccount.address}
                  </span>
                </p>
              )}
            </>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      <div className="lg:flex md:flex gap-10">
        <div>
          {!isConnected && (
            <div className="flex items-center mt-72 relative">
              <div className="flex items-center">
                <Image src={CatImg} alt="Cat" className="w-[240px]" />
                <Image src={ChatBox} alt="Cat" className="w-[828px]" />
              </div>
              <button
                className="absolute bottom-4 left-1/2"
                onClick={() => {
                  connectWallet();
                }}
              >
                <Image src={ButtonImg} alt="Cat" className="w-[240px]" />
              </button>
            </div>
          )}

          { isConnected && (
            <Connected 
              isConnected={isConnected} 
              lyrics={lyrics}  
              cardNumber={card}
              getAi={handleDrawCardAndFetchreading} 
              mint={async (description: string) => {
                await mintExample(description);
                return true;
              }}
            />
          )}

        </div>

      </div>

    </main>
  );
}

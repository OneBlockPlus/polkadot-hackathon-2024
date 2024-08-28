"use client";
import {
  web3Accounts,
  web3Enable,
  web3FromSource,
} from "@polkadot/extension-dapp";
import { useEffect, useState } from "react";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { ApiPromise, WsProvider } from "@polkadot/api";
import React from "react";

const RPC_URL = "wss://fraa-flashbox-2977-rpc.a.stagenet.tanssi.network";

const useAPI = () => {
  const [api, setApi] = useState<any>();

  useEffect(() => {
    (async () => {
      const wsProvider = new WsProvider(RPC_URL);
      const api = await ApiPromise.create({ provider: wsProvider });

      setApi(api);
    })();
  }, []); // Add empty dependency array to run effect only once

  return api;
};

const Mintpage = () => {

    const api = useAPI();
    const [selectedAccount, setSelectedAccount] =
      useState<InjectedAccountWithMeta>();
  
    const connectWallet = async () => {
      try {
        const extensions = await web3Enable("Polki"); // Await here
  
        if (extensions.length === 0) {
          throw new Error("No Extension Found");
        }
  
        const allAccounts = await web3Accounts();
        console.log(allAccounts);
  
        if (allAccounts.length > 0) {
          setSelectedAccount(allAccounts[0]);
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    const mint = async () => {
      if (!api || !selectedAccount) return;
  
      try {
        // Get the injector for the selected account
        const injector = await web3FromSource(selectedAccount.meta.source);
  
        // Set the signer for the API
        api.setSigner(injector.signer);
  
        // Create and sign the transaction
        const unsub = await api.tx.nfts
          .mint(
            25, // collection
            0, // item
            selectedAccount.address, // mintTo (accountId)
            0
          )
          .signAndSend(
            selectedAccount.address,
            { signer: injector.signer },
            ({ status, events, dispatchError }) => {
              console.log(`Transaction status: ${status.type}`);
  
              if (dispatchError) {
                if (dispatchError.isModule) {
                  const decoded = api.registry.findMetaError(
                    dispatchError.asModule
                  );
                  const { docs, name, section } = decoded;
                  console.error(`Error: ${section}.${name}: ${docs.join(" ")}`);
                } else {
                  console.error(`Error: ${dispatchError.toString()}`);
                }
              }
  
              if (status.isInBlock) {
                console.log(`Included at block hash: ${status.asInBlock}`);
                console.log("Events:");
  
                events.forEach(({ event: { data, method, section }, phase }) => {
                  console.log(`\t${phase}: ${section}.${method}:: ${data}`);
                });
              } else if (status.isFinalized) {
                console.log(`Finalized block hash: ${status.asFinalized}`);
                console.log("Events:");
  
                events.forEach(({ event: { data, method, section }, phase }) => {
                  console.log(`\t${phase}: ${section}.${method}:: ${data}`);
                });
  
                unsub();
              }
            }
          );
      } catch (error) {
        console.error(error);
      }
    };
    const createconfig = async () => {
      if (!api || !selectedAccount) return;
  
      try {
        // Get the injector for the selected account
        const injector = await web3FromSource(selectedAccount.meta.source);
  
        // Set the signer for the API
        api.setSigner(injector.signer);
  
        // Create and sign the transaction
        const unsub = await api.tx.nfts
          .create(
            selectedAccount.address, // mintTo (accountId)
            0 // item
          )
          .signAndSend(
            selectedAccount.address,
            { signer: injector.signer },
            ({ status, events, dispatchError }) => {
              console.log(`Transaction status: ${status.type}`);
  
              if (dispatchError) {
                if (dispatchError.isModule) {
                  const decoded = api.registry.findMetaError(
                    dispatchError.asModule
                  );
                  const { docs, name, section } = decoded;
                  console.error(`Error: ${section}.${name}: ${docs.join(" ")}`);
                } else {
                  console.error(`Error: ${dispatchError.toString()}`);
                }
              }
  
              if (status.isInBlock) {
                console.log(`Included at block hash: ${status.asInBlock}`);
                console.log("Events:");
  
                events.forEach(({ event: { data, method, section }, phase }) => {
                  console.log(`\t${phase}: ${section}.${method}:: ${data}`);
                });
              } else if (status.isFinalized) {
                console.log(`Finalized block hash: ${status.asFinalized}`);
                console.log("Events:");
  
                events.forEach(({ event: { data, method, section }, phase }) => {
                  console.log(`\t${phase}: ${section}.${method}:: ${data}`);
                });
  
                unsub();
              }
            }
          );
      } catch (error) {
        console.error(error);
      }
    };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F3F6]">
      <h1 className="text-center text-4xl text-green-900 font-manrope mb-10">
        Welcome To Mint 
        <br></br>
        <span> A new Era Begins From Here</span>
        
      </h1>
      <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "10vh",
        backgroundColor: "#FFFFE0",
      }}
    >
      
        <button
          style={{
            borderRadius: "0.75rem",
            backgroundColor: "#3b82f6", // Tailwind's blue-500 color
            color: "white",
            padding: "0.5rem 1rem",
            margin: "0 0.5rem",
          }}
          onClick={connectWallet}
        >
          {selectedAccount ? 'Connected' : 'Connect Wallet'}
        </button>
      
      <button
        style={{
          borderRadius: "0.75rem",
          backgroundColor: "#3b82f6", // Tailwind's blue-500 color
          margin: "0 0.5rem",
          color: "white",
          padding: "0.5rem 1rem",
        }}
        onClick={createconfig}
      >
        Create
      </button>
      <button
        style={{
          margin: "0 0.5rem",
          borderRadius: "0.75rem",
          backgroundColor: "#3b82f6", // Tailwind's blue-500 color
          color: "white",
          padding: "0.5rem 1rem",
        }}
        onClick={mint}
      >
        Mint
      </button>
    </div>
    </div>
  );
};

export default Mintpage;

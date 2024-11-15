"use client";

import React, { useState } from "react";
import { useAccountsContext } from "@/context/account";
import { useToast } from "@/hooks/use-toast";
import {
  web3Accounts,
  web3Enable,
  web3FromSource,
} from "@polkadot/extension-dapp";
import { getSoftlawApi } from "@/utils/softlaw/getApi";

export default function WalletConnect() {
  const { selectedAccount, setSelectedAccount } = useAccountsContext();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const walletConnect = async () => {
    try {
      // const wsProvider = new WsProvider("wss://testnet.soft.law/node");

      // const types = {
      //   NFT: {
      //     id: "NFTId",
      //     owner: "AccountId",
      //     name: "Vec<u8>",
      //     description: "Vec<u8>",
      //     filing_date: "Vec<u8>",
      //     jurisdiction: "Vec<u8>",
      //   },
      //   // Definición corregida del PaymentType
      //   PaymentType: {
      //     _enum: {
      //       OneTime: "Balance",
      //       Periodic: "(Balance, BlockNumber)", // Usando una tupla para los parámetros
      //     },
      //   },
      //   PaymentSchedule: {
      //     payments_made: "u32",
      //     payments_due: "u32",
      //     next_payment_block: "BlockNumber",
      //     missed_payments: "Option<u32>",
      //     penalty_amount: "Option<Balance>",
      //   },
      //   Offer: {
      //     _enum: ["License(LicenseOffer)", "Purchase(PurchaseOffer)"],
      //   },
      //   Contract: {
      //     _enum: ["License(License)", "Purchase(PurchaseContract)"],
      //   },
      //   ContractType: {
      //     _enum: ["License", "Purchase"],
      //   },
      //   LicenseOffer: {
      //     nft_id: "NFTId",
      //     licensor: "AccountId",
      //     payment_type: "PaymentType",
      //     is_exclusive: "bool",
      //     duration: "BlockNumber",
      //   },
      //   PurchaseOffer: {
      //     nft_id: "NFTId",
      //     seller: "AccountId",
      //     payment_type: "PaymentType",
      //   },
      //   License: {
      //     nft_id: "NFTId",
      //     licensor: "AccountId",
      //     licensee: "AccountId",
      //     payment_type: "PaymentType",
      //     is_exclusive: "bool",
      //     duration: "BlockNumber",
      //     start_block: "BlockNumber",
      //     payment_schedule: "Option<PaymentSchedule>",
      //   },
      //   PurchaseContract: {
      //     nft_id: "NFTId",
      //     seller: "AccountId",
      //     buyer: "AccountId",
      //     payment_type: "PaymentType",
      //     payment_schedule: "Option<PaymentSchedule>",
      //   },
      //   NFTId: "u32",
      //   OfferId: "u32",
      //   ContractId: "u32",
      //   Balance: "u128",
      //   BlockNumber: "u32",
      //   Index: "u32",
      // };

      // const api = await ApiPromise.create({
      //   provider: wsProvider,
      //   types: types,
      // });

      // const [chain, nodeName, nodeVersion] = await Promise.all([
      //   api.rpc.system.chain(),
      //   api.rpc.system.name(),
      //   api.rpc.system.version(),
      // ]);

      // console.log(
      //   `Connected to chain ${chain} using ${nodeName} v${nodeVersion}`
      // );
      // console.log("Genesis hash:", api.genesisHash.toHex());

      let api = await getSoftlawApi();
      setIsConnecting(true);
      await web3Enable("Softlaw");
      const accounts = await web3Accounts();
      const account = accounts[0];
      console.log("api AssetHub", api);

      if (!account) {
        throw new Error("No accounts found.");
      }

      if (!account?.meta?.source) {
        toast({
          title: "Invalid Account",
          description: "Account does not have a source.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Wallet Connected",
        description: `Connected to account: ${formatAddress(account.address)}`,
        className: "bg-[#252525] text-white border-[#373737]",
      });

      console.log("Selected account:", account);

      const address = account?.address;
      setSelectedAccount(account);
      console.log("address", address);
      const injector = await web3FromSource(account.meta.source);
      console.log("injector", injector);

      if (!injector) {
        toast({
          title: "Wallet Connection Failed",
          description: "Please make sure your wallet is installed and unlocked",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Wallet Connected",
        description: `Connected to account: ${formatAddress(account.address)}`,
        className: "bg-[#252525] text-white border-[#373737]",
      });
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection Error",
        description:
          error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setSelectedAccount(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
      className: "bg-[#252525] text-white border-[#373737]",
    });
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <button
      className={`min-[2000px]:text-2xl rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        isConnecting
          ? "bg-gray-500 cursor-not-allowed text-white"
          : selectedAccount
          ? "bg-[#252525] text-white hover:bg-[#373737]"
          : "bg-[#FACC15] text-[#1C1A11] hover:bg-[#fbd244]"
      }`}
      onClick={selectedAccount ? disconnect : walletConnect}
      disabled={isConnecting}
    >
      {isConnecting
        ? "Connecting..."
        : selectedAccount
        ? "Disconnect"
        : "Connect Wallet"}
    </button>
  );
}

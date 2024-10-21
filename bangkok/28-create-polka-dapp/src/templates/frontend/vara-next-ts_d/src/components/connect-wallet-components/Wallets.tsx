import React from "react";
import { memo } from "react";
import { useWallets } from "@/providers/PolkadotWalletsContext";
import type { BaseWallet } from "@polkadot-onboard/core";
import Wallet from "./Wallet";

const Wallets = () => {
  const { wallets } = useWallets();

  if (!Array.isArray(wallets)) {
    return null;
  }

  return (
    <div className="wallets">
      {wallets.map((wallet: BaseWallet) => (
        <Wallet key={wallet.metadata.title} wallet={wallet} />
      ))}
    </div>
  );
};

const MemoWallets = memo(Wallets);

export default MemoWallets;

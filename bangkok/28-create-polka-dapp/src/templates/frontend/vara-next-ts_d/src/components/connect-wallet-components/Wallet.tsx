import React from "react";
import { memo } from "react";
import type { BaseWallet } from "@polkadot-onboard/core";
import useConnectedWalletStore from "../../zustand/useConnectWalletStore";
import Image from "next/image";

const Wallet = ({ wallet }: { wallet: BaseWallet }) => {
  const { connectWallet } = useConnectedWalletStore();

  const connectWalletHandler = async () => {
    connectWallet(wallet);
  };

  return (
    <div className="wallet-option">
      {wallet?.metadata?.iconUrl && (
        <Image
          width={25}
          height={25}
          src={wallet.metadata.iconUrl}
          alt="wallet icon"
        />
      )}
      <div>{`${wallet.metadata.title}`}</div>

      <button type="button" onClick={connectWalletHandler}>
        Connect Wallet
      </button>
    </div>
  );
};

const MemoWallet = memo(Wallet);

export default MemoWallet;

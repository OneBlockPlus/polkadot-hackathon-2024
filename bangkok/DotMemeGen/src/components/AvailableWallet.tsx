import { Button, Divider } from "antd";
import { useState } from "react";
import useUserDetailsContext from "../context";

const WALLET_OPTIONS = {
  POLKADOT: "polkadot-js",
  TALISMAN: "talisman",
  POLYWALLET: "polywallet",
  SUBWALLET: "subwallet-js",
};

const AvailableWallets = (props: {
  setWallet?: (pre: string) => void;
  className?: string;
}) => {
  const { className } = props;
  const { setLoginAddress, connectWallet } = useUserDetailsContext();
  const [wallet, setWallet] = useState("");

  const handleWalletCLick = (wallet: string) => {
    connectWallet(wallet);
    setWallet(wallet);
    if (props.setWallet) {
      props.setWallet(wallet);
    }
    setLoginAddress("");
  };

  return (
    <div>
      <span className="w-full flex justify-center items-center mt-6">
        <Button
          onClick={() => handleWalletCLick(WALLET_OPTIONS.SUBWALLET)}
          className={`border-[1px] h-10 px-6 ${
            wallet === WALLET_OPTIONS.SUBWALLET ? "border-primaryButton" : ""
          }`}
        >
          <img src="/assets/subwallet-icon.png" className="w-5 h-6" alt="" />
        </Button>
      </span>
      <Divider type="horizontal" className="my-2" />
      <div className={`${className}`}>
        <Button
          onClick={() => handleWalletCLick(WALLET_OPTIONS.POLKADOT)}
          className={`border-[1px] h-10 px-6 ${
            wallet === WALLET_OPTIONS.POLKADOT ? "border-primaryButton" : ""
          }`}
        >
          <img src="/assets/polkadotjs-icon.svg" className="w-5 h-5" alt="" />
        </Button>
        <Button
          onClick={() => handleWalletCLick(WALLET_OPTIONS.TALISMAN)}
          className={`border-[1px] h-10 px-6 ${
            wallet === WALLET_OPTIONS.TALISMAN ? "border-primaryButton" : ""
          }`}
        >
          <img src="/assets/talisman-icon.svg" className="w-6 h-6" alt="" />
        </Button>
        <Button
          onClick={() => handleWalletCLick(WALLET_OPTIONS.POLYWALLET)}
          className={`border-[1px] h-10 px-6 ${
            wallet === WALLET_OPTIONS.POLYWALLET ? "border-primaryButton" : ""
          }`}
        >
          <img src="/assets/poly-wallet.svg" className="w-6 h-6" alt="" />
        </Button>
      </div>
    </div>
  );
};
export default AvailableWallets;

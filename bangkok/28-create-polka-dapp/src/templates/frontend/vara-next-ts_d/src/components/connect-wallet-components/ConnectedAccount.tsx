import React, { useState } from "react";
import useConnectedWalletStore from "../../zustand/useConnectWalletStore";
import Image from "next/image";

const shorten = (str: string | undefined) => {
  if (!str) return str;
  const size = 10;
  let result = str;
  if (str && str.length > 2 * size) {
    const start = str.slice(0, size);
    const end = str.slice(-size);
    result = `${start}...${end}`;
  }
  return result;
};

export default function ConnectedAccount() {
  const {
    disconnectWallet,
    connectedWallet,
    connectedAccount,
    disconnectAccount,
  } = useConnectedWalletStore();

  const [showDialog, setShowDialog] = useState(false);
  return (
    <div>
      <div className="connected-account">
        {connectedWallet?.metadata?.iconUrl && (
          <Image
            width={25}
            height={25}
            src={connectedWallet.metadata.iconUrl}
            alt="wallet icon"
          />
        )}
        <button
          type="button"
          onClick={() => {
            setShowDialog(!showDialog);
          }}
        >
          <div>{shorten(connectedAccount?.address)}</div>
        </button>
      </div>
      {showDialog && (
        <dialog open>
          <div className="disconnect-buttons-container">
            <button
              type="button"
              onClick={() => {
                disconnectAccount();
              }}
            >
              Disconnect Account
            </button>
            <button
              type="button"
              onClick={() => {
                disconnectWallet();
              }}
            >
              Disconnect Wallet
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}

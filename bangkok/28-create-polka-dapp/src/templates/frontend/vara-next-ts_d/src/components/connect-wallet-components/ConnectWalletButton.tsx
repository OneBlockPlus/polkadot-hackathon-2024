import { useState } from "react";
import Wallets from "./Wallets";

export default function ConnectWalletButton() {
  const [showWallets, setShowWallets] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setShowWallets(!showWallets);
        }}
      >
        {showWallets ? "Hide Wallets" : "Show Wallets"}
      </button>

      {showWallets && (
        <dialog open>
          <Wallets />
        </dialog>
      )}
    </div>
  );
}

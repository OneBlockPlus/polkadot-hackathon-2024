import React from "react";
import ConnectWalletButton from "./connect-wallet-components/ConnectWalletButton";
import useConnectedWalletStore from "../zustand/useConnectWalletStore";
import ConnectedAccount from "./connect-wallet-components/ConnectedAccount";
import ConnectAccountButton from "./connect-wallet-components/ConnectAccountButton";

export default function Header() {
  const { connectedWallet, connectedAccount } = useConnectedWalletStore();

  return (
    <header className="header">
      <div>
        <h2>create-polka-dapp</h2>
        <h2 className="vara-header">VARA Template</h2>
      </div>

      <div>
        {connectedWallet?.isConnected ? (
          connectedAccount ? (
            <ConnectedAccount />
          ) : (
            <ConnectAccountButton />
          )
        ) : (
          <ConnectWalletButton />
        )}
      </div>
    </header>
  );
}

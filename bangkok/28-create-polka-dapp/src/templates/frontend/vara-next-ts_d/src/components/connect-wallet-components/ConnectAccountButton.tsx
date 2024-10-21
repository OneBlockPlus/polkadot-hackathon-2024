import React, { useState } from "react";
import useConnectedWalletStore from "../../zustand/useConnectWalletStore";
import type { Account } from "@polkadot-onboard/core";
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

export default function ConnectAccountButton() {
  const { accounts, connectAccount, connectedWallet } =
    useConnectedWalletStore();

  const [showAccounts, setShowAccounts] = useState(false);

  function AccountItem({ account }: { account: Account }) {
    return (
      <div className="account-item">
        <div className="account-name">{shorten(account?.name)}</div>
        <div>{shorten(account?.address)}</div>
        <div>
          <button
            type="button"
            onClick={() => {
              connectAccount(account);
            }}
          >
            Connect Account
          </button>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return <div>You have No Account</div>;
  }

  return (
    <div>
      <div>
        <div className="show-accounts">
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
              setShowAccounts(!showAccounts);
            }}
          >
            {showAccounts ? "Hide Accounts" : "Show Accounts"}
          </button>
        </div>

        {showAccounts && (
          <dialog open>
            <div className="accounts-list">
              {accounts.map((account) => (
                <AccountItem key={account.address} account={account} />
              ))}
            </div>
          </dialog>
        )}
      </div>
    </div>
  );
}

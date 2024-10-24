"use client";

import React, { useState } from "react";
import { Modal } from "antd";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";

const APPNAME = "DOT ordinals";

interface Args {
  loginAddress: string;
  accounts: any[];
  setLoginAddress: (pre: any) => void;
  connectWallet: (pre: any) => void;
}

export const UserDetailsContext = React.createContext<Args>({
  loginAddress: "",
  accounts: [],
  setLoginAddress: (pre: any) => {},
  connectWallet: (pre: any) => {},
});

export function UserDetailsContextProvider(props: any) {
  const { children = null } = props;
  const [loginAddress, setLoginAddress] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const connectWallet = async (wallet: any) => {
    try {
      if (!window) return;
      const result = await web3Enable(APPNAME);

      console.log(result);

      const accounts = await web3Accounts({ extensions: [wallet] });

      setAccounts(accounts || []);

      if (accounts.length > 0) {
        setLoginAddress(accounts[0].address);
      } else {
        showModal();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <UserDetailsContext.Provider
      value={{
        loginAddress,
        accounts,
        setLoginAddress,
        connectWallet,
      }}
    >
      {children}
      <Modal
        title="Install Wallet"
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleCancel}
        okType="default"
      >
        <p>Please install polkadot compatible wallet: </p>
        <br />
        <p>
          Recommended:{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://polkadot.js.org/extension/"
          >
            polkadot.js.org/extension/ 🔗
          </a>
        </p>
        <p>
          Other:{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://polkadot.network/ecosystem/wallets/"
          >
            polkadot.network/ecosystem/wallets/ 🔗
          </a>
        </p>
        <br />
        <p>After Installation Reload this page</p>
      </Modal>
    </UserDetailsContext.Provider>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useEffect } from "react";
import { BrowserProvider, ethers, JsonRpcSigner, Network } from "ethers";

declare global {
  interface Window {
    ethereum: any;
  }
}

const defaultWalletContext: any = {
  provider: null,
  signer: null,
  account: null,
  network: null,
  connectWallet: () => {},
  disconnectWallet: () => {}, // Add disconnectWallet
  error: null,
};

export const WalletContext = createContext(defaultWalletContext);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("Metamask is not installed");

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setNetwork(network);
      setError(null);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };

  // Function to disconnect wallet (clears state)
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setNetwork(null);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet(); // Disconnect when no account is available
        }
      });

      window.ethereum.on("chainChanged", async () => {
        if (provider) {
          const updatedNetwork = await provider.getNetwork();
          setNetwork(updatedNetwork);
        }
      });
    }
  }, [provider]);

  return (
    <WalletContext.Provider
      value={{
        provider,
        signer,
        account,
        network,
        connectWallet,
        disconnectWallet, // Expose disconnectWallet in context
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};


  export const useWallet = () => React.useContext(WalletContext);

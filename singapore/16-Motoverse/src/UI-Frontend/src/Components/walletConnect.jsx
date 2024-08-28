import React from "react"
import { useState, useEffect } from "react";
import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";
import talismanIcon from "/images/walleticon.png"; // Update the path to the Talisman icon
import { toast } from "sonner";
import { usePolkaContext } from "../context/PolkaContext";

const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 3)}...${address.slice(-4)}`;
};

const WalletConnection = () => {
  const [connected, setConnected] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [account, setAccount] = useState(null);
  const { setSelectedAccount } = usePolkaContext();

  useEffect(() => {
    if (account) {
      localStorage.setItem("address", account.address);
    } else {
      localStorage.removeItem("address");
    }
  }, [account]);

  const connectWallet = async () => {
    try {
      const extensions = await web3Enable("Motoverse");

      if (extensions.length === 0) {
        alert(
          "No Extension Found. Please install or connect from your Talisman Wallet."
        );
        return;
      }

      const allAccounts = await web3Accounts();
      console.log(allAccounts);

      if (allAccounts.length > 0) {
        const selectedAccount = allAccounts[0];
        setSelectedAccount(selectedAccount);
        setAccount(selectedAccount);
        setConnected(true);
        setShowDropdown(false);
        setShowAccountPopup(false);
        toast.success("Wallet Connected Successfully", {
          duration: 2000,
        });
      } else {
        alert("No accounts found. Please authorize your wallet.");
        setConnected(false);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      alert("Error connecting to wallet. Please try again.");
    }
  };

  const disconnectWallet = () => {
    setConnected(false);
    setAccount(null);
    setSelectedAccount(null);
    setShowDropdown(false);
    setShowAccountPopup(false);
    toast.info("Wallet Disconnected", {
      duration: 2000,
    });
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const togglePopup = () => {
    setShowAccountPopup(!showAccountPopup);
  };

  return (
    <div className="relative">
      <button
        className={`rounded-full py-2 px-4 text-center text-base font-manrope ${
          connected ? "bg-[#4e7fff] text-green-0" : "bg-blue-500 text-white"
        }`}
        onClick={toggleDropdown}
      >
        {connected ? (
          <span
            className={`rounded-full py-2 px-4 text-center text-base font-manrope ${
              connected ? "bg-[#4e7fff] text-green-0" : "bg-blue-500 text-white"
            }`}
            onClick={togglePopup}
          >
            {` ${account ? formatAddress(account.address) : ""}`}
          </span>
        ) : (
          "Connect"
        )}
      </button>

      {showDropdown && !connected && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            onClick={toggleDropdown}
            className="absolute inset-0 items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          ></div>
          <div className="relative z-10 bg-white border border-gray-300 rounded-lg p-8 max-w-md w-full mx-4 md:mx-auto">
            <button
              onClick={toggleDropdown}
              className="absolute top-2 right-4 text-2xl md:text-3xl text-gray-600 hover:text-gray-900"
            >
              &times;
            </button>
            <div
              id="walletConnect"
              className="flex items-center cursor-pointer p-2"
              onClick={connectWallet}
            >
              <img
                src={talismanIcon}
                alt="Talisman Wallet"
                className="w-12 h-12 mr-4 md:w-16 md:h-16 md:mr-8 rounded-xl"
              />
              <span className="text-black text-sm md:text-base">
                Connect Wallet
              </span>
            </div>
          </div>
        </div>
      )}

      {showAccountPopup && connected && account && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={togglePopup}
        >
          <div
            className="bg-white border border-gray-300 rounded-lg p-4 md:p-6 shadow-lg max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-black text-sm md:text-base">
              Connected Address: {account.address}
            </p>
            <div className="mt-4 flex flex-col md:flex-row justify-center">
              <button
                className="bg-red-500 text-white rounded-full px-4 py-2 mt-2 md:mt-0 md:ml-4 text-xs md:text-sm md:px-6 md:py-2"
                onClick={disconnectWallet}
              >
                Disconnect
              </button>
              <button
                className="bg-blue-500 text-white rounded-full px-4 py-2 mt-2 md:mt-0 md:ml-4 text-xs md:text-sm md:px-6 md:py-2"
                onClick={togglePopup}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;

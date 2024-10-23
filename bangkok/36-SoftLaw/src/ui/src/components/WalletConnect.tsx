"use client"
import { useState } from "react";
import { Button } from "./ui/button";
// import { getSubstrateSigner } from "@/utils/substrateAccounts/wallet/getSigner";
// import { getEvmSigner } from "@/utils/evmAccounts/wallet/getSigner";
// import { getEvmSigners } from "@/utils/evmAccounts/wallet/getSigners";
// import { getSubstrateSigners } from "@/utils/substrateAccounts/wallet/getSigners";
// import { useSigner } from "@/context/UniqueContracts";

export function WalletConnectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [evmSigners, setEvmSigners] = useState([]);
  const [substrateSigners, setSubstrateSigners] = useState([]);
  // const [selectedSigner, setSelectedSigner] = useState(null);
//   const { selectedAccount,setSelectedAccount } =useSigner();

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleWallets = async () => {
    setIsOpen(!isOpen);
    // const evmAccounts = await getEvmSigners();
    // const substrateAccounts = await getSubstrateSigners();

    // const filteredSubstrateSigners = substrateAccounts.filter(
    //   (substrateWallet) =>
    //     (substrateWallet as any).injector?.name === "talisman" ||
    //     (substrateWallet as any).injector?.name === "subwallet-js"
    // );

    // verify the ownership (points), create nfts
    // 3 ways of make different money of your creation.
    // how to comercialize copyright.
    

    // setEvmSigners(evmAccounts);
    // console.log(evmAccounts);

    // setSubstrateSigners(filteredSubstrateSigners);
    // console.log(filteredSubstrateSigners);
  };

  const handleWalletSelection = () => {

    // setSelectedAccount(selectedAccount);
    // const cutAddress = `${selectedAccount.address.slice(0, 3)}...${selectedAccount.address.slice(
    //   -4
    // )}`;
    // setWalletAddress(cutAddress);
    // setIsOpen(false); 
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    // setSelectedAccount(null);
  };


  return (
    <>
      {walletAddress === null ? (
        <Button
          onClick={handleWallets}
          className="bg-white text-black px-4 py-2 text-base"
        >
          Connect
        </Button>
      ) : (
        <Button
          onClick={handleDisconnectWallet}
          className="bg-white text-black px-4 py-2 text-base"
        >
          {walletAddress} (Disconnect)
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-custom-black rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <h2 className="text-2xl font-bold mb-4">Select Wallet</h2>

            {/* EVM Wallets */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">EVM Wallets (MetaMask)</h3>
              {/* {evmSigners.length === 0 ? (
                <p>No MetaMask wallets found.</p>
              ) : (
                <ul>
                  {evmSigners.map((wallet, index) => (
                    <li key={index} className="mb-2">
                    <input
                      type="radio"
                      name="wallet"
                      value={wallet.address}
                      onChange={() => handleWalletSelection(wallet)}
                      checked={(selectedAccount as any).address === wallet.address} // Use selectedAccount from context
                    />
                    {`${wallet.address.slice(0, 3)}...${wallet.address.slice(-4)}`} - MetaMask
                  </li>
                  ))}
                </ul>
              )} */}
            </div>

            {/* Polkadot Wallets */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">
                Polkadot Wallets (Talisman/Subwallet)
              </h3>
              {/* {substrateSigners.length === 0 ? (
                <p>No Polkadot wallets found.</p>
              ) : (
                <ul>
                  {substrateSigners.map((wallet, index) => (
                    <li key={index} className="mb-2">
                      <input
                        type="radio"
                        name="wallet"
                        value={wallet.address}
                        onChange={() => handleWalletSelection(wallet)}
                        checked={(selectedAccount as any).address === wallet.address}
                      />
                      {`${wallet.address.slice(0, 3)}...${wallet.address.slice(-4)}`} - {wallet.injector.name}
                    </li>
                  ))}
                </ul>
              )} */}
            </div>

            <Button onClick={() => setIsOpen(false)} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useEffect, useState } from "react";
import Nextjs from "@/components/logos/next";
import TypeScriptLogo from "@/components/logos/typescript";
import { useWalletStore } from "@/providers/walletStoreProvider";
import { ArrowRight } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { connectedWallet, connectedAccount, api } = useWalletStore(
    (state) => state
  );

  const [balance, setBalance] = useState<number>(0);
  const [chainToken, setChainToken] = useState<string>("");
  const [chain, setChain] = useState<string>("");

  useEffect(() => {
    async function getChainData() {
      if (!api) return;
      const [chain, nodeName] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
      ]);
      setChain(`${chain} - ${nodeName}`);

      if (connectedAccount?.address) {
        const chainToken = api.registry.chainTokens[0];
        api.query.system.account(
          connectedAccount?.address,
          (res: {
            data: { free: { toHuman: () => React.SetStateAction<number> } };
          }) => {
            setBalance(res.data.free.toHuman());
            setChainToken(chainToken);
          }
        );
      }
    }
    getChainData();
  }, [api, connectedAccount]);

  async function signTransaction() {
    try {
      if (api && connectedAccount?.address && connectedWallet?.signer) {
        const signer = connectedWallet.signer;

        await api.tx.system
          .remark("Hello World")
          .signAndSend(connectedAccount.address, { signer }, () => {
            // do something with result
          });
      }
    } catch (err) {
      alert("Error signing transaction");
      console.log(err);
    }
  }

  // Example function to interact with a smart contract uing the `@polkadot/api-contract` package
  // https://polkadot.js.org/docs/api-contract/start/contract.read
  // https://www.npmjs.com/package/@polkadot/api-contract

  // async function callContractFunction() {
  //   try {
  //     if (api && connectedAccount?.address) {
  //       // Import your contract ABI and address
  //       // import contractABI from './path/to/contractABI.json';
  //       // const contractAddress = 'YOUR_CONTRACT_ADDRESS';
  //
  //       // Create a contract instance
  //       // const contract = new ContractPromise(api, contractABI, contractAddress);
  //
  //       // Call a read-only function
  //       // const { result, output } = await contract.query.yourFunctionName(connectedAccount.address, {});
  //
  //       // Call a function that modifies state
  //       // const extrinsic = contract.tx.yourFunctionName({});
  //       // await extrinsic.signAndSend(connectedAccount.address, (result) => {
  //       //   console.log(`Current status is ${result.status}`);
  //       // });
  //     }
  //   } catch (err) {
  //     alert("Error interacting with contract");
  //     console.log(err);
  //   }
  // }

  return (
    <main
      className={`${inter.className} min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 text-white py-12 px-4`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center space-x-6 mb-12">
          <TypeScriptLogo className="w-16 h-16" />
          <ArrowRight size={24} />
          <Nextjs className="w-16 h-16" />
          <ArrowRight size={24} />
          <img
            src={"/polkadot-logo.svg"}
            alt="Polkadot"
            className="w-16 h-16"
          />
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 mb-8">
          {connectedWallet?.isConnected ? (
            <div className="space-y-4">
              {connectedAccount?.address && (
                <>
                  <p className="text-xl font-semibold">
                    Balance: {balance} {chainToken}
                  </p>

                  <button
                    type="button"
                    onClick={signTransaction}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                  >
                    Sign Transaction
                  </button>
                </>
              )}
              <p className="text-sm opacity-75">{chain}</p>
            </div>
          ) : (
            <div className="text-center">
              <h4 className="text-2xl font-bold mb-4">Connect your Wallet</h4>
              <p className="opacity-75">
                Please connect your wallet to interact with the dApp.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-lg">
          Make changes to{" "}
          <code className="bg-purple-800 px-2 py-1 rounded">
            src/pages/index.tsx
          </code>
        </p>
      </div>
    </main>
  );
}

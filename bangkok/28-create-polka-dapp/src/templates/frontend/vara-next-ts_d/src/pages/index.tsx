import NextLogo from "@/components/logos/next";
import ReactLogo from "@/components/logos/react";
import TypeScriptLogo from "@/components/logos/typescript";
import useConnectedWalletStore from "@/zustand/useConnectWalletStore";
import { type SetStateAction, useEffect, useState } from "react";
// import type { HexString } from "@polkadot/util/types";

export default function Home() {
  const { connectedWallet, gearApi, connectedAccount } =
    useConnectedWalletStore();

  const [balance, setBalance] = useState<number>(0);
  const [chainToken, setChainToken] = useState<string>("");
  const [chain, setChain] = useState<string>("");

  useEffect(() => {
    async function getChainData() {
      if (!gearApi) return;
      const [chain, nodeName] = await Promise.all([
        gearApi.chain(),
        gearApi.nodeName(),
      ]);
      setChain(`${chain} - ${nodeName}`);

      if (connectedAccount?.address) {
        const chainToken = gearApi.registry.chainTokens[0];
        gearApi.query.system.account(
          connectedAccount?.address,
          (res: {
            data: { free: { toHuman: () => SetStateAction<number> } };
          }) => {
            setBalance(res.data.free.toHuman());
            setChainToken(chainToken);
          }
        );
      }
    }
    getChainData();
  }, [gearApi, connectedAccount]);

  async function signTransaction() {
    if (gearApi && connectedAccount?.address && connectedWallet?.signer) {
      try {
        const message = {
          destination: "0x100000000000000000000000000000" as `0x${string}`, // programId
          payload: "Hello World",
          gasLimit: 10000000,
        };
        const extrinsic = gearApi.message.send(message);

        await extrinsic.signAndSend(connectedAccount.address, (event) => {
          console.log(event.toHuman());
        });
      } catch (error: any) {
        console.error(`${error.name}: ${error.message}`);
      }
    }
  }
  return (
    <main className="page-body">
      <div className="logos-container">
        <TypeScriptLogo className="logo" />

        <h1>+</h1>

        <ReactLogo className="logo" />

        <h1>+</h1>

        <NextLogo className="logo" />

        <h1>+</h1>

        <img src="/images/vara-logo.svg" alt="Vara" className="logo" />
      </div>

      {connectedWallet?.isConnected ? (
        <div className="sample-transaction">
          {connectedAccount?.address && (
            <>
              <p className="balance-label">
                Balance: {balance} {chainToken}
              </p>

              <button
                type="button"
                onClick={() => {
                  signTransaction();
                }}
              >
                Sign Transaction
              </button>
            </>
          )}
          <p className="chain-label">{chain}</p>
        </div>
      ) : (
        <div>
          <h4>Conntect your Wallet</h4>
        </div>
      )}

      <p className="instructions">
        Make Changes to <code>/src/pages/index.tsx</code>
      </p>
    </main>
  );
}

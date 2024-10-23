"use client";

import { useRouter } from "next/navigation";

import { useInkathon } from "@scio-labs/use-inkathon";

import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/web3/connect-button";

export default function HomePage() {
  const router = useRouter();
  const { activeAccount } = useInkathon();

  return (
    <>
      <div className="relative flex h-fit w-full grow flex-col items-center justify-start bg-slate-900/50">
        <div className="relative flex min-h-[90vh] w-full flex-col items-start justify-center px-4 opacity-70 shadow-inner sm:px-14 md:items-end">
          {" "}
          <img
            className="absolute left-0 top-1 z-0 h-full min-w-[60rem] opacity-90 md:w-4/6"
            src="/images/hexa.svg"
          />
          <h1 className="z-10 text-6xl font-bold text-white md:text-8xl">
            Dazhbog
          </h1>
          <h2 className="z-10 mt-10 text-4xl font-bold text-white md:mt-0 md:text-6xl">
            Decentralized Perpetual Futures
          </h2>
          <div>
            {activeAccount ? (
              <Button
                onClick={() => router.push("/platform")}
                variant="default"
                className="mt-4 px-6 py-7 text-2xl"
              >
                {" "}
                Start trading{" "}
              </Button>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

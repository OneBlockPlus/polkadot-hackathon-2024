import { useState, useEffect, useRef } from "react";

import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import { Button } from "@/components/ui/button";

const logs = [
  "Creating zk proof...",
  "Generating xxxxxxx",
  "Creating ab proof...",
  "Generating key...",
  "Creating xxxx...",
];

const CreateWalletPage = () => {
  const [creatingWallet, setCreatingWallet] = useState(true);
  const [creatingProgress, setCreatingProgress] = useState(0);
  const [creatingFailed, setCreatingFailed] = useState(false);
  const interval = useRef<NodeJS.Timeout | undefined>(undefined);
  const [creatingLog, setCreatingLog] = useState<string>();

  useEffect(() => {
    if (!creatingWallet) return;

    const handleIncrement = (prev: number) => {
      if (prev === 100) {
        setCreatingWallet(false);
        clearInterval(interval.current);
        setCreatingFailed(true);
        return prev;
      }
      return prev + 10;
    };
    setCreatingProgress(handleIncrement);
    /* @ts-expect-error
     */
    interval.current = setInterval(() => {
      setCreatingProgress(handleIncrement);
      setCreatingLog(logs[Math.floor(Math.random() * logs.length)]);
    }, 2000);
    return () => clearInterval(interval.current);
  }, [creatingWallet]);

  const handleRetry = () => {
    setCreatingWallet(true);
    setCreatingProgress(0);
    setCreatingFailed(false);
  };

  return (
    <div className="flex flex-col w-full h-full justify-start items-center py-4">
      <h3 className="text-4xl leading-none tracking-tight w-full">
        {creatingWallet || !creatingFailed ? "Creating..." : "Failed creating"}
      </h3>
      <div className="relative mt-24 mb-8">
        <AnimatedCircularProgressBar
          max={100}
          min={0}
          value={creatingProgress}
          gaugePrimaryColor={
            !creatingFailed ? "rgb(79 70 229)" : "rgb(239 68 68)"
          }
          gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
        />
        <div className="absolute top-1/2 w-8/12 -translate-y-2/4 bg-white ml-7">
          {creatingWallet ? "Waiting around 4 mins" : "Failed: Wrong Passkey"}
        </div>
      </div>
      {!creatingFailed && <p className="mt-4">{creatingLog}</p>}
      {creatingFailed && (
        <div className="flex flex-col-reverse w-full h-full">
          <Button
            variant="default"
            className="mt-10 w-full"
            onClick={handleRetry}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreateWalletPage;

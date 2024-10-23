import DotImg from "@/assets/dot.png";
import animationData from "@/assets/lottie/animationSuccess.json";
import { getDB } from "@/background/db";
import { Generating } from "@/components/Generating";
import { Identicon } from "@/components/Identicon";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActivity } from "@/hooks/useActivity";
import { useAllAccounts } from "@/hooks/useAllAccounts";
import { useBestNumber } from "@/hooks/useBestNumber";
import { useCurrentAccount } from "@/hooks/useCurrentAccount";
import { useCurrentBalance } from "@/hooks/useCurrentBalance";
import { useGenerateProof } from "@/hooks/useGenerateProof";
import { useSignInWithGoogle } from "@/hooks/useSignWithGoogle";
import { formatBalance, getUSD } from "@/utils";
import CircularProgress from "@mui/joy/CircularProgress";
import { encodeAddress } from "@polkadot/keyring";
import { bnToHex } from "@polkadot/util";
import { useMutation } from "@tanstack/react-query";
import lottie from "lottie-web";
import {
  AlignLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpRight,
  Copy,
  Lock,
} from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Link, useSearchParams } from "react-router-dom";
export const HomePage = () => {
  const { data: account } = useCurrentAccount();
  const { refetch: refetchAccounts } = useAllAccounts();
  const freeBalance = useCurrentBalance();
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const activity = useActivity(account?.address);
  const generateProof = useGenerateProof();
  const bestNumber = useBestNumber();
  const signInWithGoogle = useSignInWithGoogle();

  useEffect(() => {
    refetchAccounts();
  }, [bestNumber, refetchAccounts]);

  const regenerateMutation = useMutation({
    mutationKey: ["regenerateMutation"],
    mutationFn: async () => {
      if (!account || !bestNumber) return;

      const expireMinutes = account.expireMinutes || "99999";

      const epoch = expireMinutes ? bestNumber + expireMinutes * 10 : 999999;

      const data = await signInWithGoogle.mutateAsync({
        sub: account.sub,
        prompt: false,
        epoch,
      });

      const result = await generateProof.mutateAsync({
        jwt: data.jwt,
        salt: data.salt,
        keyStr: data.keyStr,
        epoch: data.epoch.toString(),
        randomness: data.randomness,
      });

      const address = encodeAddress(bnToHex(BigInt(result.addressSeed)));

      const accountData = {
        addressSeed: result.addressSeed,
        proof: result.proof,
        address: address,
        type: data.type,
        salt: data.salt,
        lastUnlockedOn: null,
        selected: account.selected,
        nickname: data.nickName,
        jwt: data.jwt,
        keyStr: data.keyStr,
        ephPrivateKey: data.ephPrivateKey,
        epoch: data.epoch.toString(),
        nonce: data.nonce,
        randomness: data.randomness,
        sub: data.sub,
      } as any;

      const db = await getDB();

      await db.accounts.update(account.id, {
        ...accountData,
      });

      await refetchAccounts();
    },
  });

  useEffect(() => {
    if (lottieContainerRef.current && searchParams.get("type") === "success") {
      setIsPlaying(true);
      const animation = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: "svg",
        loop: false,
        autoplay: true,

        animationData,
      });
      animation.setSpeed(0.5);

      animation.addEventListener("complete", () => {
        setIsPlaying(false);
        animation.destroy();
      });

      return () => {
        animation.destroy();
      };
    }
  }, [searchParams]);

  const isLocked = account?.epoch
    ? Number(bestNumber) > Number(account.epoch)
    : false;

  console.log(Number(account?.epoch), Number(bestNumber));

  if (regenerateMutation.isPending)
    return <Generating generatingLabel="Regenerating..." />;

  return (
    <>
      <Layout>
        <div className="top-1">
          <div ref={lottieContainerRef}></div>
        </div>
        {!isPlaying && (
          <div className="relative flex flex-col w-full h-full">
            <div className="flex relative items-center space-x-2 mt-4 mx-4 rounded-lg py-2 px-4 bg-[#f1f4f8]">
              <div className="flex items-center space-x-4">
                <Identicon size={32} address={account?.address} />
              </div>
              <div className="flex flex-col justify-around h-full">
                <div className="text-base font-medium text-accent-foreground flex items-center">
                  <div className="truncate w-40">{account?.nickname}</div>
                </div>
                <div className="text-sm text-muted-foreground flex items-center">
                  <div className="truncate w-40">{account?.address}</div>
                  <CopyToClipboard
                    text={account?.address}
                    onCopy={() =>
                      enqueueSnackbar("Copied", {
                        variant: "success",
                      })
                    }
                  >
                    <Copy size={12} className="cursor-pointer" />
                  </CopyToClipboard>
                </div>
              </div>
              <div className="absolute right-4 top-2">
                <Link to="/accounts">
                  <AlignLeft />
                </Link>
              </div>
            </div>

            <div className="select-none rounded-md mt-2 mx-4 justify-center p-4 items-center flex flex-col">
              <div className="font-semibold text-2xl flex items-center">
                <span className="text-xl ml-2">$</span>
                {formatBalance(getUSD(freeBalance))}
                {isLocked && (
                  <div className="ml-2 text-muted-foreground">
                    <Lock />
                  </div>
                )}
              </div>
              <div className="mt-4 w-full flex justify-center">
                <Button variant="ghost" className="h-6 px-2 text-xs" asChild>
                  <Link to="/send">
                    <ArrowUpRight size={12} className="mr-1" />
                    Send
                  </Link>
                </Button>
              </div>
            </div>

            {isLocked ? (
              <div className="mx-4 mt-10">
                <Button
                  disabled={signInWithGoogle.isPending}
                  className="mb-3 w-full"
                  onClick={() => regenerateMutation.mutate()}
                >
                  {signInWithGoogle.isPending ? (
                    <CircularProgress size="sm" variant="plain" />
                  ) : (
                    <div className="flex items-center">
                      Unlocking your account with Google
                    </div>
                  )}
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="tokens">
                <TabsList className="mx-4">
                  <TabsTrigger value="tokens">Assets</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="tokens">
                  <div className="flex px-4 pr-6">
                    <div className="bg-white mt-1">
                      <img src={DotImg} alt="dot" className="w-10 h-10" />
                    </div>
                    <div className="flex flex-col justify-between pt-1 pb-1">
                      <div className="text-sm font-semibold mt-[2px]">DOT</div>
                      <div className="text-xs text-muted-foreground">$4.38</div>
                    </div>
                    <div className="ml-auto flex flex-col justify-between pt-1 pb-1">
                      <div className="flex text-sm font-semibold mt-[2px] gap-1">
                        {formatBalance(freeBalance)}
                        <div className="text-muted-foreground">DOT</div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        ${formatBalance(getUSD(freeBalance))}
                      </div>
                    </div>
                  </div>
                  {/* <div className="bg-white mt-2 mx-4 p-4">
                  <img src={DotImg} alt="dot" className="w-16 h-16 mx-auto" />
                </div> */}
                </TabsContent>
                <TabsContent value="activity">
                  {!activity?.length ? (
                    <div className="bg-white mt-2 mx-4 p-4">
                      <div className="flex justify-center">
                        <div className="text-sm text-center text-muted-foreground">
                          No activity yet
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white mt-2 mx-4">
                      {activity.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between py-2"
                        >
                          <div className="ml-2 uppercase text-sm flex gap-1 items-center">
                            {item.from === account?.address ? (
                              <div>
                                <ArrowUpFromLine size={20} />
                              </div>
                            ) : (
                              <div>
                                <ArrowDownToLine size={20} />
                              </div>
                            )}
                            {item.from === account?.address
                              ? "Sent"
                              : "Received"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatBalance(BigInt(item.value), { mantissa: 4 })}{" "}
                            DOT
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </Layout>
    </>
  );
};

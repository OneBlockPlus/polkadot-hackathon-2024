import AppleIcon from "@/assets/icons/Apple";
import FacebookIcon from "@/assets/icons/Facebook";
import GoogleIcon from "@/assets/icons/Google";
import TwitchIcon from "@/assets/icons/Twitch";
import { Button } from "@/components/ui/button";
import { useSignInWithGoogle } from "@/hooks/useSignWithGoogle";
import { openWelcomeInNewTab } from "@/utils";
import CircularProgress from "@mui/joy/CircularProgress";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Browser from "webextension-polyfill";
import lottie from "lottie-web";
import animationData from "@/assets/lottie/animation.json";
import { useGenerateProof } from "@/hooks/useGenerateProof";
import { encodeAddress } from "@polkadot/keyring";
import { bnToHex } from "@polkadot/util";
import { getDB } from "@/background/db";
import { makeUniqueKey } from "@/background/storageUtils";
import { useMutation } from "@tanstack/react-query";
import { useAllAccounts } from "@/hooks/useAllAccounts";

export const Welcome = () => {
  const isOpenTabInProgressRef = useRef(false);
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const generateProof = useGenerateProof();
  const { refetch: refetchAccount } = useAllAccounts();

  const saveAccountMutation = useMutation({
    mutationKey: ["saveAccount"],
    mutationFn: async (data: any) => {
      const result = await generateProof.mutateAsync({
        jwt: data.jwt,
        salt: data.salt,
        keyStr: data.keyStr,
        epoch: data.epoch.toString(),
        randomness: data.randomness,
      });

      const address = encodeAddress(bnToHex(BigInt(result.addressSeed)));

      const db = await getDB();

      const account = await db.accounts.get({ address });

      const accountData = {
        createdAt: Date.now(),
        addressSeed: result.addressSeed,
        proof: result.proof,
        address: address,
        type: data.type,
        salt: data.salt,
        lastUnlockedOn: null,
        selected: true,
        nickname: data.nickName,
        jwt: data.jwt,
        keyStr: data.keyStr,
        ephPrivateKey: data.ephPrivateKey,
        epoch: data.epoch.toString(),
        nonce: data.nonce,
        randomness: data.randomness,
        sub: data.sub,
      } as any;

      if (account) {
        await db.accounts.update(account.id, {
          ...accountData,
        });
      } else {
        await db.accounts.put({
          id: makeUniqueKey(),
          ...accountData,
        });
      }

      await db.accounts.get({ address });

      await refetchAccount();
    },
  });

  useEffect(() => {
    if (lottieContainerRef.current) {
      const animation = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData,
      });
      return () => {
        animation.destroy();
      };
    }
  }, [generateProof.isPending, saveAccountMutation.isPending]);

  useEffect(() => {
    if (
      !/type=webpage/.test(window.location.search) &&
      !isOpenTabInProgressRef.current
    ) {
      const views = Browser.extension.getViews({ type: "popup" });
      if (views.length > 0) {
        isOpenTabInProgressRef.current = true;
        openWelcomeInNewTab().finally(() => window.close());
      }
    }
  }, []);

  const signInWithGoogle = useSignInWithGoogle();
  const navigate = useNavigate();
  const signIn = async () => {
    if (signInWithGoogle.isPending) return;
    const data = await signInWithGoogle.mutateAsync({
      prompt: true,
    });
    await saveAccountMutation.mutateAsync(data);
    navigate("/home?type=success");
  };

  return (
    <div className="bg-white relative flex flex-col flex-nowrap items-center justify-center overflow-hidden shadow-lg rounded-xl w-popup-width h-popup-height">
      <div className="rounded-xl border flex flex-col items-center px-7 py-6 overflow-auto w-full h-full">
        <div className="flex flex-col w-full h-full py-4">
          <h1 className="text-5xl leading-none tracking-tight">Kless</h1>
          <p className="font-light mt-10">Instant Getting Your Web3 Account</p>
          {generateProof.isPending || saveAccountMutation.isPending ? (
            <div>
              <div ref={lottieContainerRef}></div>
              <div className="text-muted-foreground text-base text-center">
              Unlocking With ZK Proof.....
              </div>
            </div>
          ) : (
            <div className="flex flex-col mt-auto">
              <div className="text-muted-foreground text-center text-xs mb-2 select-none">
                Sign in with
              </div>
              <Button
                disabled={signInWithGoogle.isPending}
                variant="outline"
                className="mb-3"
                onClick={signIn}
              >
                {signInWithGoogle.isPending ? (
                  <CircularProgress size="sm" variant="plain" />
                ) : (
                  <div className="flex items-center">
                    <GoogleIcon className="h-6 w-6 mr-2" />
                    Google
                  </div>
                )}
              </Button>
              <Button disabled variant="outline" className="mb-3">
                <FacebookIcon className="h-6 w-6 mr-2" />
                Facebook
              </Button>
              <Button disabled variant="outline" className="mb-3">
                <TwitchIcon className="h-6 w-6 mr-2" />
                Twitch
              </Button>
              <Button disabled variant="outline">
                <AppleIcon className="h-6 w-6 mr-2" />
                Apple
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

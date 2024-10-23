import { getDB } from "@/background/db";
import { Generating } from "@/components/Generating";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllAccounts } from "@/hooks/useAllAccounts";
import { useBestNumber } from "@/hooks/useBestNumber";
import { useGenerateProof } from "@/hooks/useGenerateProof";
import { useSignInWithGoogle } from "@/hooks/useSignWithGoogle";
import CircularProgress from "@mui/joy/CircularProgress";
import { encodeAddress } from "@polkadot/keyring";
import { bnToHex } from "@polkadot/util";
import { useMutation, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ExpirePage = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState("");
  const [unit, setUnit] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const { data: accounts, refetch: refetchAccounts } = useAllAccounts();
  const [loading, setLoading] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const generateProof = useGenerateProof();
  const signInWithGoogle = useSignInWithGoogle();
  const bestNumber = useBestNumber();

  const {
    data: expireTime,
    isLoading: expireTimeLoading,
    refetch: refetchExpireTime,
  } = useQuery({
    queryKey: ["expireTime", selectedAccountId],
    staleTime: Infinity,
    queryFn: async () => {
      const db = await getDB();
      const account = await db.accounts.get(selectedAccountId);
      return account?.expireMinutes || 1440;
    },
    enabled: !!selectedAccountId,
  });

  const setExpireTime = useMutation({
    mutationKey: ["set-expireTime", selectedAccountId],
    mutationFn: async (value: number) => {
      const db = await getDB();
      await db.accounts.update(selectedAccountId, {
        expireMinutes: value,
      });
      refetchExpireTime();
    },
  });

  useEffect(() => {
    if (accounts?.length) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts]);

  useEffect(() => {
    if (!expireTimeLoading) {
      if (!expireTime) {
        setTime("1");
        setUnit("day");
        return;
      }
      const time = Number(expireTime);
      if (Number.isInteger(time / 1440)) {
        setTime((time / 1440).toString());
        setUnit("day");
      } else if (Number.isInteger(time / 60)) {
        setTime((time / 60).toString());
        setUnit("hour");
      } else {
        setTime(time.toString());
        setUnit("minute");
      }
    }
  }, [expireTime, expireTimeLoading]);

  const onSetExpireTime = async (accountId: string) => {
    try {
      setLoading(true);

      if (!accountId || !bestNumber) return;

      const db = await getDB();
      const account: any = await db.accounts.get(accountId);

      const expireMinutes =
        unit === "day"
          ? Number(time) * 1440
          : unit === "hour"
          ? Number(time) * 60
          : Number(time);

      const epoch = bestNumber + expireMinutes * 10;

      const data = await signInWithGoogle.mutateAsync({
        sub: account.sub,
        prompt: false,
        epoch,
      });

      setIsGenerating(true);
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
        epoch: epoch.toString(),
        nonce: data.nonce,
        randomness: data.randomness,
        sub: data.sub,
      } as any;

      await db.accounts.update(account.id, {
        ...accountData,
      });

      await setExpireTime.mutateAsync(expireMinutes);
      await refetchAccounts();
      await refetchExpireTime();

      enqueueSnackbar("Expire time updated", { variant: "success" });
      navigate("/settings");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return <Generating generatingLabel="Regenerating..." />;
  }

  return (
    <Layout type="backToSettings" title="Change Expire Time">
      <div className="p-4 h-full flex flex-col">
        <div className="flex flex-col gap-3 mb-8">
          <div className="mb-1 text-muted-foreground text-left">
            Once expired, the zk proof will be regenerated. The ephemeral key
            will be rotated.
          </div>
          <div>
            <Select
              onValueChange={(value) => setSelectedAccountId(value)}
              value={selectedAccountId}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((account: any) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.nickname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Input value={time} onChange={(e) => setTime(e.target.value)} />
            <Select onValueChange={(value) => setUnit(value)} value={unit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minute">Minute</SelectItem>
                <SelectItem value="hour">Hour</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => onSetExpireTime(selectedAccountId)}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <CircularProgress size="sm" />
              </div>
            ) : (
              <div className="flex gap-1 items-center">Continue</div>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

import { getDB } from "@/background/db";
import { makeUniqueKey } from "@/background/storageUtils";
import { Generating } from "@/components/Generating";
import { Identicon } from "@/components/Identicon";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAllAccounts } from "@/hooks/useAllAccounts";
import { useCurrentAccount } from "@/hooks/useCurrentAccount";
import { useGenerateProof } from "@/hooks/useGenerateProof";
import { cn } from "@/lib/utils";
import { useApi } from "@/state/api";
import { formatBalance, getUSD } from "@/utils";
import CircularProgress from "@mui/joy/CircularProgress";
import { encodeAddress } from "@polkadot/keyring";
import { bnToHex, stringToU8a, u8aToBn } from "@polkadot/util";
import { useMutation } from "@tanstack/react-query";
import { decodeJwt } from "jose";
import { CircleCheck } from "lucide-react";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AccountCard = ({ account }: { account: any }) => {
  const { data: currentAccount } = useCurrentAccount();
  const { refetch: refetchAllAccount } = useAllAccounts();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<bigint | null>(null);
  const api = useApi();
  useEffect(() => {
    if (!api || !account?.address) return;
    api.query.system.account(account.address, (data: any) => {
      setBalance(BigInt((data as any).data.free.toBigInt()));
    });
  }, [account?.address, api, setBalance]);

  return (
    <div
      onClick={async () => {
        const db = await getDB();
        db.transaction("rw", db.accounts, async () => {
          await db.accounts.toCollection().modify({ selected: false });
          await db.accounts.update(account.id, { selected: true });
        });
        refetchAllAccount();
        navigate("/home");
      }}
      className={cn(
        "select-none relative flex items-center gap-2 rounded-lg py-2 px-4 border cursor-pointer hover:bg-[#f1f4f8]"
      )}
    >
      <div className="flex items-center space-x-4">
        <Identicon size={32} address={account?.address} />
      </div>
      <div className="flex flex-col justify-around h-full flex-1">
        <div className="text-sm font-medium text-accent-foreground">
          {account?.nickname}
        </div>
        <div className="flex gap-1 items-center text-sm text-muted-foreground">
          <div className="truncate text-xs w-32">{account?.address}</div>
          <div className="text-muted-foreground text-xs ml-auto">
            ${formatBalance(getUSD(balance))}
          </div>
        </div>
      </div>
      {currentAccount?.address === account.address && (
        <div className="absolute text-green-500 top-2 right-2">
          <CircleCheck size={16} />
        </div>
      )}
    </div>
  );
};

export const AccountsPage = () => {
  const { data: accounts, refetch: refetchAccounts } = useAllAccounts({
    enabled: true,
  });
  const { data: currentAccount } = useCurrentAccount();
  const { enqueueSnackbar } = useSnackbar();
  const generateProof = useGenerateProof();

  const createNewAccountMutation = useMutation({
    mutationKey: ["createNewAccount"],
    onSuccess: () => {
      enqueueSnackbar("Account created", {
        variant: "success",
      });
    },
    mutationFn: async () => {
      if (!currentAccount) return;
      const decodedJWT = decodeJwt(currentAccount.jwt);
      const salt = u8aToBn(
        stringToU8a(`${accounts.length + 1}/${decodedJWT.email}`)
      ).toString();
      const result = await generateProof.mutateAsync({
        jwt: currentAccount.jwt,
        salt,
        keyStr: currentAccount.keyStr,
        epoch: currentAccount.epoch.toString(),
        randomness: currentAccount.randomness,
      });

      const address = encodeAddress(bnToHex(BigInt(result.addressSeed)));
      console.log("address", address);
      const db = await getDB();

      const account = await db.accounts.get({ address });

      const accountData = {
        createdAt: Date.now(),
        addressSeed: result.addressSeed,
        proof: result.proof,
        address: address,
        type: currentAccount.type,
        salt,
        lastUnlockedOn: null,
        selected: true,
        nickname: `${decodedJWT.email}#${accounts.length}`,
        jwt: currentAccount.jwt,
        keyStr: currentAccount.keyStr,
        ephPrivateKey: currentAccount.ephPrivateKey,
        epoch: currentAccount.epoch.toString(),
        nonce: currentAccount.nonce,
        randomness: currentAccount.randomness,
        sub: currentAccount.sub,
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

      await refetchAccounts();
    },
  });

  return createNewAccountMutation.isPending ? (
    <Generating />
  ) : (
    <Layout type="back" title="Manage Accounts">
      <div className="p-4 min-h-full">
        <div className="flex flex-col gap-3 mb-8">
          {accounts?.map((account: any) => (
            <AccountCard key={account.address} account={account} />
          ))}
        </div>
        <div className="mt-auto">
          <Button
            disabled={createNewAccountMutation.isPending}
            className="w-full mb-8 select-none"
            onClick={() => createNewAccountMutation.mutateAsync()}
          >
            {createNewAccountMutation.isPending ? (
              <div className="flex items-center">
                <CircularProgress size="sm" variant="solid" />
              </div>
            ) : (
              <div className="flex items-center">Create New Account</div>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

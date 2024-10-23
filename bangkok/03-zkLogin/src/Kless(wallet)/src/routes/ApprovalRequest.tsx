import { Identicon } from "@/components/Identicon";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAllAccounts } from "@/hooks/useAllAccounts";
import { useBestNumber } from "@/hooks/useBestNumber";
import { useTxRequest } from "@/hooks/useTxRequest";
import { prepareCall } from "@/lib/prepareCall";
import { useApi } from "@/state/api";
import { useAppStore } from "@/state/store";
import CircularProgress from "@mui/joy/CircularProgress";
import { addressEq } from "@polkadot/util-crypto";
import { CircleCheck, CircleX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

export const ApprovalRequestPage = () => {
  const background = useAppStore((state) => state.background);
  const updateRequest = useAppStore((state) => state.updateRequest);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const { requestID } = useParams();
  const bestNumber = useBestNumber();
  const tx = useTxRequest(requestID);
  console.log("tx", tx);
  const { data: account } = useAllAccounts({
    select: (accounts) => {
      return accounts.find((item: any) =>
        addressEq(item.address, tx?.tx.address)
      );
    },
  });
  const api = useApi();

  const call = useMemo(() => {
    if (!api || !tx?.tx?.method) return;

    const _call = api.createType("Call", tx?.tx?.method);
    return api.tx[_call.section][_call.method](..._call.args);
  }, [api, tx?.tx?.method]);

  const method = useMemo(() => {
    if (!call) return;

    return `${call.method.section}.${call.method.method}(${(call.meta as any)
      .toHuman()
      .args.map((item: any) => item.name)
      .join(", ")})`;
  }, [call]);

  const info = useMemo(() => {
    if (!call) return;
    return (call.method.meta.toHuman().docs as any).join("");
  }, [call]);

  const args = useMemo(() => {
    if (!call) return;
    return JSON.stringify(call.method.toJSON().args);
  }, [call]);

  const handleResponse = async (allowed: boolean) => {
    if (!tx || !account || !api) return;
    if (allowed) {
      setApproveLoading(true);
      const { uxt, address, zkMaterial } = await prepareCall(
        api,
        account,
        tx.tx.method
      );

      const zkLoginCall = api.tx.zkLogin.submitZkloginUnsigned(
        uxt,
        address,
        zkMaterial
      );

      const unsignedTx = zkLoginCall.method.toHex();

      const signedTx = zkLoginCall.signFake(account.address, {
        blockHash: api.genesisHash,
        genesisHash: api.genesisHash,
        nonce: 0,
        runtimeVersion: api.runtimeVersion,
      });

      const txResult = {
        ...tx,
        approved: true,
        fakeSignedTx: signedTx.toHex(),
        unsignedTx,
      };

      background.sendTransactionRequestResponse(
        tx.id,
        true,
        txResult,
        undefined,
        txResult
      );

      updateRequest(tx.id, {
        approved: true,
        txResult: txResult,
      });

      setApproveLoading(false);
    } else {
      background.sendTransactionRequestResponse(
        tx.id,
        false,
        undefined,
        undefined,
        undefined
      );

      updateRequest(tx.id, {
        approved: false,
        txResult: undefined,
      });
    }
  };

  useEffect(() => {
    if (tx && bestNumber && account && bestNumber > Number(account.epoch)) {
      updateRequest(tx.id, {
        approved: false,
        txResult: undefined,
        txResultError: "The account is locked",
      });
    }
  }, [account, bestNumber, tx, updateRequest]);

  useEffect(() => {
    if (tx && tx.approved !== null) {
      window.close();
    }
  }, [tx]);

  return (
    <Layout type="approve" title="Transaction">
      <div className="p-4">
        <div>
          <div className="flex items-center space-x-2 rounded-lg py-2 px-4 border">
            <div className="flex items-center space-x-4">
              <Identicon size={32} address={account?.address} />
            </div>
            <div className="flex flex-col justify-around h-full">
              <div className="text-base font-medium text-accent-foreground">
                {account?.nickname}
              </div>
              <div className="text-sm truncate w-32 text-muted-foreground">
                {account?.address}
              </div>
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-4 mt-4 space-y-2">
          <div className="flex justify-between">
            <div className="font-medium mr-6">Date</div>
            <div className="text-muted-foreground">
              {tx?.createdDate && new Date(tx.createdDate).toLocaleString()}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="font-medium mr-6">Origin</div>
            <div className="text-muted-foreground">{tx?.origin}</div>
          </div>
          <div className="flex justify-between">
            <div className="font-medium mr-6">GenesisHash</div>
            <div className="text-muted-foreground break-all truncate">
              {tx?.tx?.genesisHash}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="font-medium mr-6">SpecVersion</div>
            <div className="text-muted-foreground">
              {Number(tx?.tx?.specVersion)}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="font-medium mr-6">Nonce</div>
            <div className="text-muted-foreground">{Number(tx?.tx?.nonce)}</div>
          </div>
          <div className="flex justify-between flex-col">
            <div className="font-medium mr-6">Method</div>
            <div className="text-muted-foreground text-left">{method}</div>
          </div>
          <div className="flex justify-between flex-col">
            <div className="font-medium mr-6">Params</div>
            <div className="text-muted-foreground text-left break-all">
              {args}
            </div>
          </div>
          <div className="flex justify-between flex-col">
            <div className="font-medium mr-6">Info</div>
            <div className="text-muted-foreground text-left">{info}</div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-center p-4">
        <Button
          onClick={() => handleResponse(false)}
          disabled={cancelLoading || approveLoading}
          variant="outline"
          className="flex-1"
        >
          {cancelLoading ? (
            <div className="flex justify-center items-center">
              <CircularProgress size="sm" />
            </div>
          ) : (
            <div className="flex gap-1 items-center">
              <CircleX size={16} /> Cancel
            </div>
          )}
        </Button>
        <Button
          onClick={() => handleResponse(true)}
          disabled={cancelLoading || approveLoading}
          className="flex-1"
        >
          {approveLoading ? (
            <div className="flex justify-center items-center">
              <CircularProgress size="sm" />
            </div>
          ) : (
            <div className="flex gap-1 items-center">
              <CircleCheck size={16} /> Approve
            </div>
          )}
        </Button>
      </div>
    </Layout>
  );
};

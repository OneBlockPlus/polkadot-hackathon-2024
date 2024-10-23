import { Identicon } from "@/components/Identicon";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentAccount } from "@/hooks/useCurrentAccount";
import { useCurrentBalance } from "@/hooks/useCurrentBalance";
import { prepareCall } from "@/lib/prepareCall";
import { useApi } from "@/state/api";
import { formatBalance } from "@/utils";
import { useState } from "react";
import { parseUnits } from "viem";
import { useSnackbar } from "notistack";
import CircularProgress from "@mui/joy/CircularProgress";
import { useNavigate } from "react-router-dom";

export const TransferPage = () => {
  const { data: account } = useCurrentAccount();
  const freeBalance = useCurrentBalance();
  const api = useApi();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const onSubmit = async () => {
    if (!api || !toAddress || !amount) return;
    setLoading(true);
    const call = api.tx.balances.transferKeepAlive(
      toAddress,
      parseUnits(amount, 12)
    );

    const { uxt, address, zkMaterial } = await prepareCall(api, account, call);

    const zkLoginCall = api.tx.zkLogin.submitZkloginUnsigned(
      uxt,
      address,
      zkMaterial
    );

    const result: any = await new Promise((resolve, reject) => {
      let isSuccessful = false;

      zkLoginCall
        .send(({ events = [], status }) => {
          console.log("Transaction status:", status.type);
          if (status.isInBlock) {
            console.log("Included at block hash", status.asInBlock.toHex());
            console.log("Events:");

            events.forEach(({ event: { data, method, section }, phase }) => {
              console.log(
                "\t",
                phase.toString(),
                `: ${section}.${method}`,
                data.toString()
              );
              if (`${section}.${method}` === "system.ExtrinsicSuccess") {
                isSuccessful = true;
              }
            });
            
            resolve({
              result: isSuccessful ? "success" : "failed",
            });
          } else if (status.isFinalized) {
            resolve({
              result: isSuccessful ? "success" : "failed",
            });
            console.log("Finalized block hash", status.asFinalized.toHex());
          }
        })
        .catch((e) => {
          console.log("Transfer failed", e);
          resolve({
            result: "failed",
          });
        });
    });

    if (result.result === "success") {
      enqueueSnackbar("Transfer success", { variant: "success" });
    }

    if (result.result === "failed") {
      enqueueSnackbar("Transfer failed", { variant: "error" });
    }
    setAmount("");
    setToAddress("");
    setLoading(false);
    navigate("/home");
  };

  return (
    <Layout type="back" title="Send">
      <div className="p-4">
        <div>
          <div className="font-medium text-sm mb-1">From</div>
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
        </div>
        <div>
          <div className="font-medium text-sm mt-4 mb-1">To</div>
          <div>
            <Input
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="w-full rounded-lg py-2 px-4 border"
              placeholder="To Address"
            />
          </div>
        </div>
        <div>
          <div className="font-medium text-sm mt-4 mb-1">Amount</div>
          <div>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg py-2 px-4 border"
              placeholder="Amount"
            />
            <div className="text-sm text-right">
              Balance: {formatBalance(freeBalance)}
              <span className="text-muted-foreground ml-1">DOT</span>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <Button
            disabled={!api || loading}
            className="w-full mt-4"
            onClick={onSubmit}
          >
            {loading ? (
              <CircularProgress size="sm" variant="solid" />
            ) : (
              <div className="flex items-center">Send</div>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

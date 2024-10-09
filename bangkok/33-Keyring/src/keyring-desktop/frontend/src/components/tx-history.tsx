import { GetTransactionHistory } from "@/../wailsjs/go/main/App";
import { BrowserOpenURL } from "@/../wailsjs/runtime";
import { useToast } from "@/components/ui/use-toast";
import { RemoteRequestTime, shortenAddress, showTime } from "@/lib/utils";
import { ledgerAddressAtom, ledgerAtom } from "@/store/state";
import { useAtomValue } from "jotai";
import {
  ArrowBigLeft,
  ArrowBigRight,
  ExternalLink,
  Minus,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { MIN_INTERVAL } from "@/constants";
import { EventsOff, EventsOn } from "@/../wailsjs/runtime/runtime";
import { main } from "@/../wailsjs/go/models";

type Transaction = {
  from: string;
  to: string;
  value: string;
  timestamp: number;
  hash: string;
  symbol: string;
};

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(6);
  const [total, setTotal] = useState(0);
  const [lastRemoteRequestTime, setLastRemoteRequestTime] = useState<RemoteRequestTime>({});

  const { toast } = useToast();

  const ledgerAddress = useAtomValue(ledgerAddressAtom);
  const ledger = useAtomValue(ledgerAtom)

  useEffect(() => {
    EventsOn("transaction-history", (txHistory) => {
      handleHistoryResponse(txHistory);
    });

    return () => {
      EventsOff("transaction-history");
    };
  }, []);

  useEffect(() => {
    let responseSubscribed = true;
    const fn = async () => {
      if (!ledgerAddress) {
        return;
      }
      try {
        const isRemote = (Date.now() - (lastRemoteRequestTime[ledgerAddress.ledger] || 0)) > MIN_INTERVAL;
        if (isRemote) {
          setLastRemoteRequestTime(prevState => ({
            ...prevState,
            [ledgerAddress.ledger]: Date.now()
          }));
        }

        let txHistory = await GetTransactionHistory(
          ledgerAddress.ledger,
          ledgerAddress.address,
          100,
          0,
          isRemote
        );
        if (responseSubscribed) {
          handleHistoryResponse(txHistory);
        }
      } catch (err) {
        toast({
          title: "Uh oh! Something went wrong.",
          description: `Error happens: ${err}`,
        });
      }
    };

    fn();
    return () => {
      responseSubscribed = false;
    };
  }, [ledgerAddress]);

  const handleHistoryResponse = (txHistory: main.GetTransactionHistoryResponse) => {
    if (txHistory.chain != ledger || !ledgerAddress || txHistory.chain != ledgerAddress.ledger || txHistory.address != ledgerAddress.address) {
      return;
    }
    let mergedTxs = [
      ...txHistory.transactions.map((tx) => ({
        ...tx,
        symbol: ledgerAddress.config.symbol,
      })),
      ...txHistory.tokenTransfers,
    ];
    const txSet = new Map();
    for (const tx of mergedTxs) {
      txSet.set(tx.hash, tx);
    }
    let uniqueTxs = Array.from(txSet.values()).sort(
      (a, b) => b.timestamp - a.timestamp
    );
    setTransactions(uniqueTxs);
    setTotal(uniqueTxs.length);
  }

  const handleNextPage = () => {
    if (end >= total) {
      return;
    }
    setStart(start + 6);
    setEnd(end + 6);
  };

  const handlePreviousPage = () => {
    if (start <= 0) {
      return;
    }
    setStart(start - 6);
    setEnd(end - 6);
  };

  const isSent = (tx: Transaction) =>
    tx.from === ledgerAddress!.address ||
    (tx.from === "" && Number(tx.value) < 0);

  return (
    <div>
      <div className="bg-secondary shadow overflow-hidden rounded-xl mt-8 divide-y divide-gray-200 w-[420px] ml-[-10px]">
        {transactions.slice(start, end).map((tx, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-4 py-4"
          >
            <div className="flex items-center">
              {isSent(tx) ? (
                <Minus
                  className="rounded-full bg-red-100 px-2 h-10 w-10"
                  color="#c23000"
                />
              ) : (
                <Plus
                  className="rounded-full px-2 h-10 w-10 bg-green-100"
                  color="green"
                />
              )}
              <div className="flex flex-col ml-4 gap-1">
                <div className="flex flex-row gap-2 items-start justify-start">
                  <Label>{isSent(tx) ? "Sent" : "Received"}</Label>

                  <Label className="text-gray-500">
                    {Math.abs(Number(tx.value)).toLocaleString()}{" "}
                    {shortenAddress(tx.symbol)}
                  </Label>
                </div>
                <Label className="text-sm text-gray-500">
                  {isSent(tx) && tx.to && `To: ${shortenAddress(tx.to)}`}
                  {!isSent(tx) && tx.from && `From: ${shortenAddress(tx.from)}`}
                </Label>
              </div>
            </div>

            <div className="flex flex-row items-center gap-3">
              <Label className="text-sm text-gray-500">
                {showTime(tx.timestamp)}
              </Label>
              <ExternalLink
                onClick={() =>
                  BrowserOpenURL(
                    `${ledgerAddress!.config.explorer}${ledgerAddress!.config.explorerTx}/${tx.hash}`
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-row mt-3 justify-center gap-6">
        <ArrowBigLeft
          className="rounded-full bg-secondary px-2 h-10 w-10"
          color={start <= 0 ? "#c4c4c4" : "#EEC959"}
          onClick={handlePreviousPage}
        />
        <ArrowBigRight
          className="rounded-full bg-secondary px-2 h-10 w-10"
          color={end >= total ? "#c4c4c4" : "#EEC959"}
          onClick={handleNextPage}
        />
      </div>
    </div>
  );
};

export default TransactionHistory;

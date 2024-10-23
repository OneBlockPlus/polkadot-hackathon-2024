import { SendTransaction, SignTypedData } from "@/../wailsjs/go/main/App";
import { BrowserOpenURL } from "@/../wailsjs/runtime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ETH } from "@/constants";
import { EIP155_SIGNING_METHODS } from "@/data/wallet-connect";
import { chainConfigsAtom, ledgerAddressAtom } from "@/store/state";
import { createWeb3Wallet, web3wallet } from "@/utils/WalletConnectUtil";
import { SessionTypes, SignClientTypes } from "@walletconnect/types";
import { WalletKit, WalletKitTypes } from '@reown/walletkit'
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";
import { useAtomValue } from "jotai";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import GasFee from "./gas";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";

interface Props {
  cardId: number;
  explorer: string;
  explorerTx: string;
}

interface ReqeustData {
  requestEvent: SignClientTypes.EventArguments["session_request"];
  requestSession: SessionTypes.Struct;
}

const WalletConnect = ({
  cardId,
  explorer,
  explorerTx,
}: Props) => {
  const [showConnect, setShowConnect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");
  const [pin, setPin] = useState("");
  const [gas, setGas] = useState("");
  const [txFee, setTxFee] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [requestData, setRequestData] = useState<ReqeustData>();
  const [proposal, setProposal] =
    useState<WalletKitTypes.SessionProposal>();

  const { toast } = useToast();

  const chainConfigs = useAtomValue(chainConfigsAtom);
  const accountLedgerInfo = useAtomValue(ledgerAddressAtom);

  useEffect(() => {
    let listened = true;
    const onInitialize = async () => {
      try {
        await createWeb3Wallet();
        setInitialized(true);
        if (listened) {
          web3wallet.on("session_proposal", onSessionProposal);
          web3wallet.on("session_request", onSessionRequest);
        }
      } catch (err) {
        toast({
          title: "Uh oh! Something went wrong with walletconnect.",
          description: `Error happens: ${err}`,
        });
      }
    };
    if (!initialized) {
      onInitialize();
    }
    return () => {
      listened = false;
    };
  }, []);

  const onSessionProposal = (
    proposal: WalletKitTypes.SessionProposal
  ) => {
    setProposal(proposal);
  };

  const onSessionRequest = async (
    requestEvent: SignClientTypes.EventArguments["session_request"]
  ) => {
    const { topic } = requestEvent;
    const requestSession = web3wallet.engine.signClient.session.get(topic);

    setRequestData({ requestEvent, requestSession });
  };

  const supportedNamespaces = useMemo(() => {
    const evmChains = chainConfigs
      .filter((chain) => chain.driver === "evm")
      .map((chain) => `eip155:${chain.chainId}`);

    const evmMethods = Object.values(EIP155_SIGNING_METHODS);

    return {
      eip155: {
        chains: evmChains,
        methods: evmMethods,
        events: ["accountsChanged", "chainChanged"],
        accounts: evmChains.map((chain) => `${chain}:${accountLedgerInfo!.address}`).flat(),
      },
    };
  }, []);

  const connect = async () => {
    try {
      setLoading(true);
      await web3wallet.pair({ uri: link });
      setShowConnect(false);
      toast({
        title: "Success!",
        description: "Connected with DApp.",
      });
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const approveProposal = async () => {
    if (proposal) {
      const namespaces = buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces,
      });

      try {
        setLoading(true);
        await web3wallet.approveSession({
          id: proposal.id,
          namespaces,
        });
        toast({
          title: "Success!",
          description: "Session is approved.",
        });

        setProposal(undefined);
      } catch (err) {
        toast({
          title: "Uh oh! Something went wrong.",
          description: `Error happens: ${err}`,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const rejectProposal = async () => {
    if (proposal) {
      try {
        await web3wallet.rejectSession({
          id: proposal.id,
          reason: getSdkError("USER_REJECTED_METHODS"),
        });
        setProposal(undefined);
      } catch (err) {
        toast({
          title: "Uh oh! Something went wrong.",
          description: `Error happens: ${err}`,
        });
      }
    }
  };

  // from string,
  // to string,
  // chainName string,
  // value string,
  // gas string,
  // data string,
  // tip string,
  // pin string,
  // cardId int,
  const approveDataRequest = async () => {
    if (requestData) {
      const { topic, params, id } = requestData.requestEvent;
      const { chainId, request } = params; // TODO check chain id is matched
      const transaction = request.params[0];

      try {
        setLoading(true);
        let result = "";
        switch (request.method) {
          case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
            result = await SendTransaction(
              transaction.from,
              transaction.to,
              accountLedgerInfo!.ledger,
              transaction.value,
              transaction.gas,
              transaction.data,
              gas,
              pin,
              cardId
            );
            break;
          case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
          case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
          case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
            result = await SignTypedData(
              accountLedgerInfo!.ledger,
              request.params[1],
              pin,
              cardId
            );
            break;
          default:
            break;
        }

        const response = { id, result: result, jsonrpc: "2.0" };
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
        toast({
          title: "Send data successfully.",
          description: `${result}`,
          action: (
            <Button
              onClick={() =>
                BrowserOpenURL(`${explorer}${explorerTx}/${result}`)
              }
            >
              Open
            </Button>
          ),
        });
        setRequestData(undefined);
      } catch (err) {
        toast({
          title: "Uh oh! Something went wrong.",
          description: `Error happens: ${err}`,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const rejectDataRequest = async (description: string) => {
    if (requestData) {
      const { topic, params, id } = requestData.requestEvent;
      const response = {
        id,
        jsonrpc: "2.0",
        error: {
          code: 5000,
          message: "User rejected.",
        },
      };
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
        setRequestData(undefined);
        toast({
          title: "The request is rejected",
          description: description,
        })
      } catch (err) {
        toast({
          title: "Uh oh! Something went wrong.",
          description: `Error happens: ${err}`,
        });
      }
    }
  };

  const connectDialog = () => {
    return (
      <Dialog open={true} onOpenChange={() => setShowConnect(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>WalletConnect</DialogTitle>
            <DialogDescription>
              Copy the connection link from DApp, for example: <span className="underline block mt-2 font-bold text-primary">wc:60d2229a92ad6af...27058d0e5cb78</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-row items-center justify-center gap-4">
            <Label className="text-right">Link:</Label>
            <Input onChange={(e) => setLink(e.target.value)}></Input>
          </div>
          <DialogFooter>
            {loading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connect
              </Button>
            ) : (
              <Button type="submit" onClick={() => connect()}>
                Connect
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const proposalDialog = () => {
    const metadata = proposal!.params.proposer.metadata;
    const { icons, name, url } = metadata;
    return (
      <Dialog open={true} onOpenChange={() => setProposal(undefined)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Wallet Connect</DialogTitle>
            <DialogDescription>
              Do you want to accept this proposal?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4">
            <Avatar>
              <AvatarImage src={icons[0]} />
              <AvatarFallback>n/a</AvatarFallback>
            </Avatar>
            <Label>{name} wants to connect your wallet.</Label>
          </div>
          <DialogFooter>
            {loading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approve
              </Button>
            ) : (
              <Button type="submit" onClick={approveProposal}>
                Approve
              </Button>
            )}

            <Button type="submit" onClick={rejectProposal}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const sendTransactionModal = () => {
    const metadata = requestData!.requestSession!.peer.metadata;
    const transaction = requestData!.requestEvent!.params.request.params[0];
    const { icons, name, url } = metadata;

    return (
      <Dialog open={true} onOpenChange={() => rejectDataRequest("User closed the request.")}>
        <DialogContent className="sm:max-w-[465px]">
          <DialogHeader>
            <DialogTitle>Wallet Connect</DialogTitle>
            <DialogDescription>
              Do you want to approve this request on {accountLedgerInfo!.ledger}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-6">
            <Avatar>
              <AvatarImage src={icons[0]} />
              <AvatarFallback>n/a</AvatarFallback>
            </Avatar>
            <Label>{name} wants to request operation from your wallet.</Label>
            <div className="flex flex-col w-full">
              <Label className="mb-2">Send Transaction:</Label>
              <div className="flex flex-row gap-2 items-center justify-center">
                <Label className="w-[50px]">From:</Label>
                <Input value={transaction.from} disabled></Input>
              </div>
              <div className="flex flex-row gap-2 items-center justify-center">
                <Label className="w-[50px]">To:</Label>
                <Input value={transaction.to} disabled></Input>
              </div>
              <div className="flex flex-row gap-2 items-center justify-center">
                <Label className="w-[80px]">GasLimit:</Label>
                <Input
                  value={BigInt(transaction.gas).toString()}
                  disabled
                ></Input>
              </div>
              <div className="flex flex-row gap-2 items-center justify-center">
                <Label className="w-[50px]">Value:</Label>
                <Input
                  value={(Number(transaction.value || "0") / ETH).toString()}
                  disabled
                ></Input>
              </div>
              <div className="flex flex-row gap-2 items-center justify-center">
                <Label className="w-[50px]">Data:</Label>
                <Input value={transaction.data} disabled></Input>
              </div>
            </div>

            <div className="self-start">
              <GasFee
                chainName={accountLedgerInfo!.ledger}
                nativeSymbol={accountLedgerInfo!.config.symbol}
                from={transaction.from}
                to={transaction.to}
                setGas={setGas}
                setFee={setTxFee}
              />
            </div>

            <div className="flex flex-row items-center justify-center gap-4">
              <Label className="text-right">PIN</Label>
              <Input
                type="password"
                onChange={(e) => setPin(e.target.value)}
              ></Input>
            </div>
          </div>
          <DialogFooter>
            {loading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approve
              </Button>
            ) : (
              <Button type="submit" onClick={approveDataRequest}>
                Approve
              </Button>
            )}

            <Button type="submit" onClick={() => rejectDataRequest("User rejected.")}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const unknownMethodModal = (method: string) => {
    return (
      <Dialog open={true} onOpenChange={() => setRequestData(undefined)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>WalletConnect</DialogTitle>
          </DialogHeader>
          <div className="flex flex-row items-center justify-center gap-4">
            <Label className="text-right">Unknown method:</Label>
            <Input className="w-auto" disabled value={method} />
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="button" onClick={() => setRequestData(undefined)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const signTypedDataModal = () => {
    const metadata = requestData!.requestSession!.peer.metadata;
    const data = requestData!.requestEvent!.params.request.params[1];
    const { icons, name, url } = metadata;

    return (
      <Dialog open={true} onOpenChange={() => rejectDataRequest("User closed the request.")}>
        <DialogContent className="sm:max-w-[465px]">
          <DialogHeader>
            <DialogTitle>Wallet Connect</DialogTitle>
            <DialogDescription>
              Do you want to approve this request on {accountLedgerInfo!.ledger}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-6">
            <Avatar>
              <AvatarImage src={icons[0]} />
              <AvatarFallback>n/a</AvatarFallback>
            </Avatar>
            <Label>{name} wants to sign data from your wallet.</Label>
            <div className="flex flex-col w-full">
              <div className="flex flex-row gap-2 items-center justify-center">
                <Label className="w-[50px]">Data:</Label>
                <Input value={data} disabled></Input>
              </div>
            </div>

            <div className="flex flex-row items-center justify-center gap-4">
              <Label className="text-right">PIN</Label>
              <Input
                type="password"
                onChange={(e) => setPin(e.target.value)}
              ></Input>
            </div>
          </div>
          <DialogFooter>
            {loading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approve
              </Button>
            ) : (
              <Button type="submit" onClick={approveDataRequest}>
                Approve
              </Button>
            )}

            <Button type="submit" onClick={() => rejectDataRequest("User rejected.")}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const requestDialog = () => {
    const { params, id } = requestData!.requestEvent!;
    const { chainId, request } = params;
    const config = chainConfigs.find((config) => config.name == accountLedgerInfo!.ledger);
    if (!config || chainId != `eip155:${config.chainId}`) {
      rejectDataRequest("Please choose the correct blockchain.");
      return;
    }

    switch (request.method) {
      case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
        return sendTransactionModal();

      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
      case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
        return signTypedDataModal();

      default:
        return unknownMethodModal(request.method);
    }
  };

  return (
    <div>
      {initialized && (
        <div
          className="flex flex-col h-12 w-12 rounded-xl bg-primary text-white p-3 items-center justify-center"
          onClick={() => setShowConnect(true)}
        >
          <img src="/walletconnect.svg" alt="WalletConnect" />
        </div>
      )}

      {showConnect && connectDialog()}
      {proposal && proposalDialog()}
      {requestData && requestDialog()}
    </div>
  );
};

export default WalletConnect;

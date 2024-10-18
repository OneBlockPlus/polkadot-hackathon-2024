import {
  RemoveAsset,
  Staking,
  Teleport,
  Transfer,
  VerifyAddress,
} from "@/../wailsjs/go/main/App";
import { utils } from "@/../wailsjs/go/models";
import { BrowserOpenURL } from "@/../wailsjs/runtime";
import { LogoImageSrc } from "@/components/logo";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { useClipboard } from "@/hooks/useClipboard";
import { accountAtom, refreshAtom } from "@/store/state";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue, useSetAtom } from "jotai";
import { Clipboard, ClipboardCheck, Loader2, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SyntheticEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import GasFee from "./gas";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Props = {
  ledger: string;
  symbol: string;
  symbolImage: string;
  nativeSymbol: string;
  balance?: string;
  address: string;
  contract?: string;
  explorer: string;
  explorerTx: string;
  chainConfig: utils.ChainConfig;
};

const AssetTransferSchema = z.object({
  toAddr: z.string().trim().min(1),
  amount: z.string().trim().min(1),
  pin: z.string().transform((val, ctx) => {
    if (val.length !== 6 || isNaN(Number(val))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PIN must have 6 digits",
      });

      return z.NEVER;
    }
    return val;
  }),
});

const AssetStakingSchema = z.object({
  pool: z.string().trim().min(1),
  amount: z.string().trim().min(1),
  pin: z.string().transform((val, ctx) => {
    if (val.length !== 6 || isNaN(Number(val))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PIN must have 6 digits",
      });

      return z.NEVER;
    }
    return val;
  }),
});

const Asset = ({
  ledger,
  symbol,
  symbolImage,
  nativeSymbol,
  balance,
  address,
  contract,
  explorer,
  explorerTx,
  chainConfig,
}: Props) => {
  const [loadingTx, setLoadingTx] = useState(false);
  const [loadingRemoveAsset, setLoadingRemoveAsset] = useState(false);
  const [gas, setGas] = useState("");
  const [txFee, setTxFee] = useState("");
  const [pin, setPin] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const [txConfirmOpen, setTxConfirmOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [isTeleport, setIsTeleport] = useState(false);
  const [parachainId, setParachainId] = useState(0);

  const [stakingOpen, setStakingOpen] = useState(false);

  const account = useAtomValue(accountAtom);
  const setRefresh = useSetAtom(refreshAtom);

  const { toast } = useToast();

  const { hasCopied, onCopy } = useClipboard();

  useEffect(() => {
    if (hasCopied) {
      toast({ description: "Copied to clipboard!" });
    }
  }, [hasCopied]);

  const transferForm = useForm<z.infer<typeof AssetTransferSchema>>({
    resolver: zodResolver(AssetTransferSchema),
  });

  const stakingForm = useForm<z.infer<typeof AssetStakingSchema>>({
    resolver: zodResolver(AssetStakingSchema),
  });

  const showBalance = (balance: string | undefined) => {
    if (balance) {
      return parseFloat(parseFloat(balance).toFixed(3)).toLocaleString();
    }
    return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
  };

  const receive = () => {
    setReceiveOpen(true);
  };

  const transfer = (data: z.infer<typeof AssetTransferSchema>) => {
    setLoadingTx(true);
    if (isTeleport) {
      console.log("parachainId", parachainId);
      if (parachainId === 0) {
        toast({
          variant: "destructive",
          title: "Please select a parachain.",
          description: "Please select a parachain to teleport the asset.",
        });
        setLoadingTx(false);
        setPin("");
        return;
      }

      Teleport(
        symbol,
        contract ? contract : "",
        ledger,
        address,
        data.toAddr,
        data.amount,
        gas,
        data.pin,
        account.id,
        parachainId
      )
        .then((resp) => {
          setLoadingTx(false);
          setTxConfirmOpen(false);
          setTransferOpen(false);
          setPin("");
          toast({
            title: "Send transaction successfully.",
            description: `${resp}`,
            action: (
              <Button
                onClick={() =>
                  BrowserOpenURL(`${explorer}${explorerTx}/${resp}`)
                }
              >
                Open
              </Button>
            ),
          });
        })
        .catch((err) => {
          setLoadingTx(false);
          setPin("");
          toast({
            title: "Uh oh! Something went wrong.",
            description: `Error happens: ${err}`,
          });
        });
      return;
    }

    Transfer(
      symbol,
      contract ? contract : "",
      ledger,
      address,
      data.toAddr,
      data.amount,
      gas,
      data.pin,
      account.id
    )
      .then((resp) => {
        setLoadingTx(false);
        setTxConfirmOpen(false);
        setTransferOpen(false);
        setPin("");
        toast({
          title: "Send transaction successfully.",
          description: `${resp}`,
          action: (
            <Button
              onClick={() => BrowserOpenURL(`${explorer}${explorerTx}/${resp}`)}
            >
              Open
            </Button>
          ),
        });
      })
      .catch((err) => {
        setLoadingTx(false);
        setPin("");
        toast({
          title: "Uh oh! Something went wrong.",
          description: `Error happens: ${err}`,
        });
      });
  };

  const staking = (data: z.infer<typeof AssetStakingSchema>) => {
    setLoadingTx(true);
    console.log("staking", data);
    console.log("address", address);
    Staking(
      symbol,
      contract ? contract : "",
      ledger,
      address,
      data.pool,
      data.amount,
      gas,
      data.pin,
      account.id
    )
      .then((resp) => {
        setLoadingTx(false);
        setTxConfirmOpen(false);
        setTransferOpen(false);
        setPin("");
        toast({
          title: "Send transaction successfully.",
          description: `${resp}`,
          action: (
            <Button
              onClick={() => BrowserOpenURL(`${explorer}${explorerTx}/${resp}`)}
            >
              Open
            </Button>
          ),
        });
      })
      .catch((err) => {
        setLoadingTx(false);
        setPin("");
        toast({
          title: "Uh oh! Something went wrong.",
          description: `Error happens: ${err}`,
        });
      });
  };

  const verifyAddr = async () => {
    try {
      let addr = await VerifyAddress(account.id, ledger, pin);
      if (addr === address) {
        toast({
          title: "Your receive address is verified.",
          description: `${addr}`,
        });
        setVerified(true);
        setPin("");
      } else {
        setPin("");
        toast({
          variant: "destructive",
          title: "Your receive address is hacked.",
          description:
            "Please remove the malicious software, then reset the app and connect with your card again.",
        });
      }
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  const showReceiveAddrQRcode = () => {
    return (
      <Dialog
        open={true}
        onOpenChange={() => {
          setReceiveOpen(false);
          setVerified(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receive Address</DialogTitle>
            <DialogDescription>
              You can verify the address by connecting the card.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 items-start">
            <div className="flex flex-col gap-1">
              <Label>PIN:</Label>
              <Input
                type="password"
                onChange={(event) => setPin(event.target.value)}
                value={pin}
              />
            </div>
            <Button className="w-1/3" onClick={verifyAddr}>
              Verify Address
            </Button>
          </div>
          {verified && (
            <div className="flex flex-col gap-4 mt-6">
              <div>
                <Label>Address:</Label>
                <div className="flex flex-row gap-0">
                  <Input disabled value={address} />
                  <Button
                    className="rounded-full"
                    onClick={() => onCopy(address)}
                  >
                    {hasCopied ? <ClipboardCheck /> : <Clipboard />}
                  </Button>
                </div>
              </div>
              <QRCodeSVG
                value={address}
                size={128}
                imageSettings={{
                  src: LogoImageSrc,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  const showTxConfirmDialog = () => {
    return (
      <Dialog
        open={true}
        onOpenChange={() => {
          setTxConfirmOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Transaction</DialogTitle>
            <DialogDescription>
              Sending <span className="font-bold underline">{symbol}</span> on{" "}
              <span className="font-bold underline">{ledger}</span> blockchain
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-1 items-center">
              <Label>To:</Label>
              <Input disabled value={transferForm.getValues().toAddr} />
              <div
                className=""
                onClick={() => onCopy(transferForm.getValues().toAddr)}
              >
                {hasCopied ? <ClipboardCheck /> : <Clipboard />}
              </div>
            </div>
            <div className="flex flex-row gap-1 items-center">
              <Label>Amount:</Label>
              <Input disabled value={transferForm.getValues().amount} />
            </div>
            {txFee && (
              <div className="flex flex-row gap-1 items-center">
                <Label>Fee:</Label>
                <Badge>{nativeSymbol}</Badge>
                <Input disabled value={txFee} />
              </div>
            )}

            {loadingTx ? (
              <Button className="w-1/3 self-end" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-1/3 self-end"
                onClick={() => transfer(transferForm.getValues())}
              >
                Confirm
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const showStakingConfirmDialog = () => {
    console.log("staking confirm", stakingForm.getValues());
    return (
      <Dialog
        open={true}
        onOpenChange={() => {
          setTxConfirmOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Transaction</DialogTitle>
            <DialogDescription>
              Staking <span className="font-bold underline">{symbol}</span> on{" "}
              <span className="font-bold underline">{ledger}</span> blockchain
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-1 items-center">
              <Label>Pool ID:</Label>
              <Input disabled value={stakingForm.getValues().pool} />
              <div
                className=""
                onClick={() => onCopy(stakingForm.getValues().pool)}
              >
                {hasCopied ? <ClipboardCheck /> : <Clipboard />}
              </div>
            </div>
            <div className="flex flex-row gap-1 items-center">
              <Label>Amount:</Label>
              <Input disabled value={stakingForm.getValues().amount} />
            </div>
            {txFee && (
              <div className="flex flex-row gap-1 items-center">
                <Label>Fee:</Label>
                <Badge>{nativeSymbol}</Badge>
                <Input disabled value={txFee} />
              </div>
            )}

            {loadingTx ? (
              <Button className="w-1/3 self-end" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-1/3 self-end"
                onClick={() => staking(stakingForm.getValues())}
              >
                Confirm
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const stakingSheet = () => {
    return (
      <Sheet open={stakingOpen} onOpenChange={setStakingOpen}>
        <SheetTrigger>
          <Button
            onClick={() => {
              setStakingOpen(true);
              stakingForm.reset();
              setGas("");
              setTxFee("");
              setTxConfirmOpen(false);
            }}
          >
            Staking
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              Staking {symbol} on {ledger} blockchain
            </SheetTitle>
            <div className="flex flex-row gap-2 items-center text-lg">
              <Label className="underline">Balance</Label>
              <Input className="text-lg" disabled value={balance} />
            </div>
          </SheetHeader>
          <Form {...stakingForm}>
            <form
              className="space-y-6 mt-4"
              onSubmit={stakingForm.handleSubmit(staking)}
            >
              <FormField
                control={stakingForm.control}
                name="pool"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Pool ID</FormLabel>
                    <FormControl>
                      <Input onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={stakingForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={stakingForm.control}
                name="pin"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>PIN</FormLabel>
                    <FormControl>
                      <Input type="password" onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* <GasFee
                chainName={ledger}
                nativeSymbol={nativeSymbol}
                from={address}
                to={stakingForm.getValues().pool.toString()}
                setGas={setGas}
                setFee={setTxFee}
              /> */}

              <Button
                type="button"
                className="w-1/2"
                onClick={() => setTxConfirmOpen(true)}
              >
                Send
              </Button>

              {txConfirmOpen && showStakingConfirmDialog()}
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    );
  };

  const removeAsset = async () => {
    try {
      setLoadingRemoveAsset(true);
      await RemoveAsset(account.id, ledger, address, symbol, contract!);
      setLoadingRemoveAsset(false);
      setRefresh(true);
    } catch (err) {
      setLoadingRemoveAsset(false);
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  const handleImgError = (e: SyntheticEvent<HTMLImageElement>) => {
    e.stopPropagation();
    setImgUrl("/tokens/erc20_logo.png");
  };

  const showAssetImage = () => {
    if (imgUrl) {
      return imgUrl;
    }
    if (symbolImage) {
      return symbolImage;
    }
    return `/tokens/${symbol}_logo.png`;
  };

  return (
    <div>
      <AccordionItem value={symbol + ledger}>
        <AccordionTrigger>
          <div
            className={`flex flex-row items-center justify-between grow
                        bg-secondary rounded-xl shadow-md p-2 pr-6
                        hover:bg-primary hover:text-white`}
          >
            <div className="flex flex-row items-center gap-3">
              <img
                className="w-12 rounded-full"
                src={showAssetImage()}
                onError={handleImgError}
              />

              <Label className="text-lg">{symbol}</Label>
            </div>

            <Label className="text-lg">{showBalance(balance)}</Label>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex gap-2 items-center">
            <Sheet open={transferOpen} onOpenChange={setTransferOpen}>
              <SheetTrigger className="flex gap-2 items-center">
                <Button
                  onClick={() => {
                    setTransferOpen(true);
                    transferForm.reset();
                    setGas("");
                    setTxFee("");
                    setTxConfirmOpen(false);
                    setIsTeleport(false);
                  }}
                >
                  Transfer
                </Button>
                {chainConfig.driver === "substrate" && (
                  <Button
                    onClick={() => {
                      setTransferOpen(true);
                      transferForm.reset();
                      setGas("");
                      setTxFee("");
                      setTxConfirmOpen(false);
                      setIsTeleport(true);
                    }}
                  >
                    Teleport
                  </Button>
                )}
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    Sending {symbol} on {ledger} blockchain
                  </SheetTitle>
                  <div className="flex flex-row gap-2 items-center text-lg">
                    <Label className="underline">Balance</Label>
                    <Input className="text-lg" disabled value={balance} />
                  </div>
                </SheetHeader>
                <Form {...transferForm}>
                  <form
                    className="space-y-6 mt-4"
                    onSubmit={transferForm.handleSubmit(transfer)}
                  >
                    {isTeleport && (
                      <Select
                        onValueChange={(v) => setParachainId(parseInt(v))}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Parachain" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">Asset Hub</SelectItem>
                          <SelectItem value="1002">Bridge Hub</SelectItem>
                          <SelectItem value="1005">Coretime</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    <FormField
                      control={transferForm.control}
                      name="toAddr"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>To</FormLabel>
                          <FormControl>
                            <Input onChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={transferForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input onChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={transferForm.control}
                      name="pin"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>PIN</FormLabel>
                          <FormControl>
                            <Input type="password" onChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <GasFee
                      chainName={ledger}
                      nativeSymbol={nativeSymbol}
                      from={address}
                      to={transferForm.getValues().toAddr}
                      setGas={setGas}
                      setFee={setTxFee}
                    />

                    <Button
                      type="button"
                      className="w-1/2"
                      onClick={() => setTxConfirmOpen(true)}
                    >
                      Send
                    </Button>

                    {txConfirmOpen && showTxConfirmDialog()}
                  </form>
                </Form>
              </SheetContent>
            </Sheet>
            {chainConfig.driver === "substrate" && stakingSheet()}
            <Button onClick={receive}>Receive</Button>
            {contract &&
              (loadingRemoveAsset ? (
                <Loader2 className="ml-2 animate-spin" />
              ) : (
                <Trash2 className="ml-2" onClick={() => removeAsset()} />
              ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {receiveOpen && showReceiveAddrQRcode()}
    </div>
  );
};

export default Asset;

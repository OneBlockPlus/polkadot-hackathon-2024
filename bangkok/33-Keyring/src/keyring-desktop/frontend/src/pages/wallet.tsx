import {
  AddAsset,
  AddCustomToken,
  GetAddressAndAssets,
  GetAssetPrices,
  GetChainConfig,
} from "@/../wailsjs/go/main/App";
import { main, utils } from "@/../wailsjs/go/models";
import { BrowserOpenURL } from "@/../wailsjs/runtime/runtime";
import WalletConnect from "@/components/WalletConnect";
import Asset from "@/components/asset";
import TransactionHistory from "@/components/tx-history";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { MIN_INTERVAL } from "@/constants";
import { useClipboard } from "@/hooks/useClipboard";
import { RemoteRequestTime, cn, shortenAddress } from "@/lib/utils";
import {
  accountAtom,
  isTestnetAtom,
  ledgerAddressAtom,
  ledgerAtom,
  refreshAtom,
} from "@/store/state";
import { useAtom, useAtomValue } from "jotai";
import {
  Check,
  ChevronsUpDown,
  Clipboard,
  ClipboardCheck,
  ExternalLink,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

type SelectToken = {
  value: string;
  symbol: string;
  contract: string;
};

function Wallet() {
  const [chainConfig, setChainConfig] = useState<utils.ChainConfig>();
  const [openSelectAssets, setOpenSelectAssets] = useState(false);
  const [selectToken, setSelectToken] = useState<SelectToken | undefined>(
    undefined
  );
  const [loadingAddAsset, setLoadingAddAsset] = useState(false);
  const [chainAssets, setChainAssets] = useState<main.ChainAssets>();
  const [showTokenConfigDialog, setShowTokenConfigDialog] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const [priceId, setPriceId] = useState("");
  const [lastPriceRequestTime, setLastPriceRequestTime] =
    useState<RemoteRequestTime>({});

  const ledger = useAtomValue(ledgerAtom);
  const account = useAtomValue(accountAtom);
  const isTestnet = useAtomValue(isTestnetAtom);
  const refresh = useAtomValue(refreshAtom);

  const [accountAddress, setAccountAddress] = useAtom(ledgerAddressAtom);

  const { toast } = useToast();

  const { hasCopied, onCopy } = useClipboard();

  // get the address for a specific chain
  useEffect(() => {
    let responseSubscribed = true;
    const fn = async () => {
      if (account.id && ledger) {
        try {
          let config = await GetChainConfig(ledger);
          setChainConfig(config);

          let assets = await GetAddressAndAssets(account.id, ledger);
          setChainAssets(assets);
          setAccountAddress({ ledger, address: assets.address, config });
          if (!assets.address) {
            toast({
              description: `You are ready to add a new blockchain`,
            });
          }

          const fetchPrice =
            Date.now() - (lastPriceRequestTime[ledger] || 0) > MIN_INTERVAL;
          if (fetchPrice) {
            if (responseSubscribed) {
              setLastPriceRequestTime((prevState) => ({
                ...prevState,
                [ledger]: Date.now(),
              }));
              let prices = await GetAssetPrices(account.id, ledger);
              if (responseSubscribed) {
                setChainAssets(prices);
              }
            }
          }
        } catch (err) {
          toast({
            title: "Uh oh! Something went wrong.",
            description: `Error happens: ${err}`,
          });
        }
      }
    };

    fn();
    return () => {
      responseSubscribed = false;
    };
  }, [ledger, isTestnet]);

  useEffect(() => {
    if (hasCopied) {
      toast({ description: "Copied to clipboard!" });
    }
  }, [hasCopied]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "r" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        checkAndRefresh();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (refresh) {
      window.location.reload();
    }
  }, [refresh]);

  const checkAndRefresh = () => {
    if (Date.now() - (lastPriceRequestTime[ledger] || 0) > MIN_INTERVAL) {
      window.location.reload();
    } else {
      toast({
        title: "Please wait a moment",
        description: `Refresh will be available in ${MIN_INTERVAL / 1000} seconds`,
      });
    }
  };

  const addAsset = async () => {
    try {
      setLoadingAddAsset(true);
      let res = await AddAsset(
        account.id,
        ledger,
        chainAssets!.address,
        selectToken!.symbol,
        selectToken!.contract
      );
      setLoadingAddAsset(false);
      setChainAssets(res);
      setSelectToken(undefined);
    } catch (err) {
      setLoadingAddAsset(false);
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  const showAssetValue = () => {
    if (!chainAssets) return 0;

    const tokensValue = chainAssets.assets.reduce(
      (temp, asset) =>
        temp + parseFloat(asset.balance || "0") * (asset.price || 0),
      0
    );
    const nativeValue =
      parseFloat(chainAssets.balance || "0") * (chainAssets.price || 0);

    const total = tokensValue + nativeValue;

    return parseFloat(total.toFixed(2));
  };

  const addTokenConfig = async () => {
    try {
      let res = await AddCustomToken(
        account.id,
        ledger,
        chainAssets!.address,
        contractAddress,
        priceId
      );
      setChainAssets(res);
      setShowTokenConfigDialog(false);
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  const tokenConfigDialog = () => {
    return (
      <Dialog open={true} onOpenChange={setShowTokenConfigDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Token</DialogTitle>
            <DialogDescription>
              <div className="mt-3 text-sm">
                Price API ID can be found on{" "}
                <span className="font-bold">CoinGecko</span>, for example,
                "ethereum" is the API ID for ETH, your can find it from the
                page: https://www.coingecko.com/en/coins/ethereum
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5 mt-3">
            <div className="flex flex-col gap-2">
              <Label>Contract Address</Label>
              <Input
                onChange={(event) => setContractAddress(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Price Id (optional)</Label>
              <Input onChange={(event) => setPriceId(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={addTokenConfig}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex flex-col mt-20 gap-20 flex-grow items-center">
      <Tabs defaultValue="assets" className="w-[400px]">
        <TabsList className="grid w-full h-auto p-1 grid-cols-2 bg-gray-200 rounded-lg">
          <TabsTrigger className="text-lg rounded-lg" value="assets">
            Assets
          </TabsTrigger>
          <TabsTrigger className="text-lg rounded-lg" value="transactions">
            Transactions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="assets">
          <div className="mt-6 flex flex-col gap-2">
            <div className="flex flex-row justify-between">
              <div className="flex flex-row items-center gap-3">
                <Label className="text-lg">Total</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <RefreshCw
                        className="h-5"
                        onClick={() => checkAndRefresh()}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to refresh</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Label className="text-lg">${showAssetValue()}</Label>
            </div>

            <Accordion type="single" collapsible>
              {chainAssets && (
                <Asset
                  ledger={ledger}
                  symbol={chainAssets?.symbol}
                  symbolImage={chainAssets?.img}
                  nativeSymbol={chainAssets?.symbol}
                  balance={chainAssets.balance}
                  address={chainAssets.address}
                  explorer={chainConfig!.explorer}
                  explorerTx={chainConfig!.explorerTx}
                  chainConfig={chainConfig!}
                />
              )}
              {chainAssets?.assets.map((userAsset) => {
                return (
                  <Asset
                    ledger={ledger}
                    key={userAsset.symbol}
                    symbol={userAsset.symbol}
                    symbolImage={userAsset.img}
                    nativeSymbol={chainAssets?.symbol}
                    balance={userAsset.balance}
                    address={chainAssets.address}
                    contract={userAsset.contractAddress}
                    explorer={chainConfig!.explorer}
                    explorerTx={chainConfig!.explorerTx}
                    chainConfig={chainConfig!}
                  />
                );
              })}
            </Accordion>

            <div className="mt-6 flex flex-row justify-center gap-3">
              <Popover
                open={openSelectAssets}
                onOpenChange={setOpenSelectAssets}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSelectAssets}
                    className="w-[200px] justify-between text-md"
                  >
                    {selectToken ? selectToken.symbol : "Select a token..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col justify-start w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search token..." />
                    <CommandEmpty>No token found.</CommandEmpty>
                    <CommandGroup className="overflow-auto max-h-56">
                      {chainConfig?.tokens?.map((token) => (
                        <CommandItem
                          key={token.symbol}
                          onSelect={(currentValue) => {
                            if (
                              selectToken &&
                              selectToken.value === currentValue
                            ) {
                              setSelectToken(undefined);
                            } else {
                              setSelectToken({
                                value: currentValue,
                                symbol: token.symbol,
                                contract: token.contract,
                              });
                            }
                            setOpenSelectAssets(false);
                          }}
                        >
                          <div className="flex flex-row items-center gap-12">
                            <div className="flex flex-row items-center">
                              <img
                                className="w-6 mr-2 rounded-full"
                                src={`/tokens/${token.symbol}_logo.png`}
                              />
                              <Label>{token.symbol}</Label>
                            </div>
                            <Check
                              className={cn(
                                "h-5 w-5",
                                selectToken?.symbol === token.symbol
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                  <div
                    className="self-center m-1 p-2 bg-secondary rounded-full text-zinc-600 hover:bg-primary hover:text-white"
                    onClick={() => setShowTokenConfigDialog(true)}
                  >
                    <Plus />
                  </div>
                </PopoverContent>
              </Popover>
              {loadingAddAsset ? (
                <Button className="text-md" disabled>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Please wait
                </Button>
              ) : (
                <Button className="text-md" onClick={addAsset}>
                  Add Asset
                </Button>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="transactions">
          {chainAssets && <TransactionHistory />}
        </TabsContent>
      </Tabs>

      <div className="absolute right-16 top-6 flex flex-row gap-2 items-center">
        <Label className="text-sm underline font-bold">{ledger}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onCopy(chainAssets!.address)}
                className="rounded-3xl"
              >
                <Label className="mr-2">
                  {shortenAddress(chainAssets ? chainAssets.address : "")}
                </Label>
                {hasCopied ? <ClipboardCheck /> : <Clipboard />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to copy address</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Menubar className="border-none">
          <MenubarMenu>
            <MenubarTrigger className="px-0">
              <MoreVertical />
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem
                onClick={() =>
                  BrowserOpenURL(
                    `${chainConfig!.explorer}${chainConfig!.explorerAddr}/${
                      chainAssets!.address
                    }`
                  )
                }
              >
                <div className="flex flex-row gap-2 items-center">
                  <ExternalLink />
                  <Label>View on explorer</Label>
                </div>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      {chainAssets?.address && chainConfig?.enableWalletConnect && (
        <div className="absolute right-10 bottom-10">
          <WalletConnect
            cardId={account.id}
            explorer={chainConfig!.explorer}
            explorerTx={chainConfig!.explorerTx}
          />
        </div>
      )}

      {showTokenConfigDialog && tokenConfigDialog()}
    </div>
  );
}

export default Wallet;

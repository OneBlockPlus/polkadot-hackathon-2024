import {
  AddLedger,
  GetChainConfigs,
  GetChains,
  IsTestnetEnabled,
} from "@/../wailsjs/go/main/App";
import { main } from "@/../wailsjs/go/models";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  accountAtom,
  chainConfigsAtom,
  isTestnetAtom,
  ledgerAtom,
  showNewLedgerAtom,
  showSidebarItem,
} from "@/store/state";
import { useAtom, useAtomValue } from "jotai";
import { FlaskRound, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Accounts from "./accounts";
import Settings from "./settings";
import Wallet from "./wallet";

function WelcomePage() {
  const [chains, setChains] = useState<main.ChainDetail[]>([]);
  const [ledgerCandidate, setLedgerCandidate] = useState("");
  const [pin, setPin] = useState("");
  const [loadingLedger, setLoadingLedger] = useState(false);

  const [showNewLedger, setShowNewLedger] = useAtom(showNewLedgerAtom);
  const [ledger, setLedger] = useAtom(ledgerAtom);
  const [allowTestnet, setAllowTestnet] = useAtom(isTestnetAtom);
  const account = useAtomValue(accountAtom);
  const [chainConfigs, setChainConfigs] = useAtom(chainConfigsAtom);
  const [sidebarItem, setSidebarItem] = useAtom(showSidebarItem);

  const { toast } = useToast();

  // get chains of the account
  useEffect(() => {
    GetChains(account.id)
      .then((chains) => {
        setLedger(chains.lastSelectedChain);
        setChains(chains.chains);
        if (sidebarItem == "") {
          setSidebarItem("ledger");
        }
      })
      .catch((err) => {
        toast({
          title: "Uh oh! Something went wrong.",
          description: `Error happens: ${err}`,
        });
      });
  }, [account, sidebarItem]);

  useEffect(() => {
    (async () => {
      let chainConfigs = await GetChainConfigs();
      setChainConfigs(chainConfigs);
      const res = await IsTestnetEnabled();
      setAllowTestnet(res);
    })();
  }, []);

  const addLedger = async () => {
    try {
      setLoadingLedger(true);
      let _ = await AddLedger(account.id, ledgerCandidate, pin);
      let chains = await GetChains(account.id);
      setChains(chains.chains);
      setLedger(chains.lastSelectedChain);
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
    setShowNewLedger(false);
    setLoadingLedger(false);
  };

  // TODO refactor to a new component
  const newLedgerDialog = () => {
    return (
      <Dialog open={true} onOpenChange={setShowNewLedger}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add a New Blockchain</DialogTitle>
            <DialogDescription>
              Choose one from the below list.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-6">
            <div className="flex flex-row gap-3 items-center justify-between">
              <Label>Blockchain:</Label>
              <Select onValueChange={setLedgerCandidate}>
                <SelectTrigger className="w-2/3">
                  <SelectValue placeholder="Select a blockchain" />
                </SelectTrigger>
                <SelectContent className="h-80">
                  <SelectGroup>
                    <SelectLabel>Mainnet</SelectLabel>
                    {chainConfigs.map((chainConfig) => {
                      return (
                        !chainConfig.disable &&
                        !chainConfig.testnet && (
                          <SelectItem
                            key={chainConfig.name}
                            value={chainConfig.name}
                          >
                            <div className="flex flex-row items-center gap-2">
                              <img
                                className="w-7 rounded-full"
                                src={`${chainConfig.img}`}
                              />
                              <Label>{chainConfig.name}</Label>
                            </div>
                          </SelectItem>
                        )
                      );
                    })}
                  </SelectGroup>
                  {allowTestnet && (
                    <SelectGroup>
                      <SelectLabel>Testnet</SelectLabel>
                      {chainConfigs.map((chainConfig) => {
                        return (
                          !chainConfig.disable &&
                          chainConfig.testnet && (
                            <SelectItem
                              key={chainConfig.name}
                              value={chainConfig.name}
                            >
                              <div className="flex flex-row items-center gap-2">
                                <div className="relative">
                                  <img
                                    className="w-7 rounded-full"
                                    src={`${chainConfig.img}`}
                                  />
                                  <FlaskRound className="absolute top-0 right-0 h-3 w-3 text-primary-foreground" />
                                </div>
                                <Label>{chainConfig.name}</Label>
                              </div>
                            </SelectItem>
                          )
                        );
                      })}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-row gap-3 items-center justify-between">
              <Label>PIN:</Label>
              <Input
                type="password"
                className="w-2/3"
                onChange={(event) => setPin(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            {loadingLedger ? (
              <Button className="" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" className="" onClick={addLedger}>
                Confirm
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const mainScreen = () => {
    switch (sidebarItem) {
      case "settings":
        return <Settings />;
      case "accounts":
        return <Accounts />;
      case "ledger":
        return chains.length === 0 || !ledger ? <Guide /> : <Wallet />;
      default:
        return <Guide />;
    }
  };

  return (
    <div className="flex flex-row">
      {showNewLedger && newLedgerDialog()}
      <Sidebar chains={chains} lastSelectedChain={ledger} />
      {mainScreen()}
    </div>
  );
}

const Guide = () => {
  return (
    <div className="flex flex-col justify-center grow gap-8">
      <h1 className="text-5xl text-center">Welcome</h1>
      <h1 className="text-2xl text-center">
        Click the <Plus className="inline bg-gray-300 rounded-full m-2" />{" "}
        button on left to start!
      </h1>
    </div>
  );
};

export default WelcomePage;

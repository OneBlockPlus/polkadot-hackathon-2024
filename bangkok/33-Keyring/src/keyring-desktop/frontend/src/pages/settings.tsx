import {
  CheckUpdates,
  ClearData,
  DoUpdate,
  EnableTestnet,
  GetCurrentVersion,
  Install,
  IsTestnetEnabled,
  ResetCard,
  ResetWallet,
} from "@/../wailsjs/go/main/App";
import { EventsOff, EventsOn } from "@/../wailsjs/runtime/runtime";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useClipboard } from "@/hooks/useClipboard";
import { accountAtom, isTestnetAtom, showSidebarItem } from "@/store/state";
import { useAtom, useSetAtom } from "jotai";
import { Loader2, Rocket } from "lucide-react";
import { useEffect, useState } from "react";

const Settings = () => {
  const [pin, setPin] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const [latestVersion, setLatestVersion] = useState("");
  const [checkVersionLoading, setCheckVersionLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const setShowSidebarItem = useSetAtom(showSidebarItem);
  const [isTestnet, setIsTestnet] = useAtom(isTestnetAtom);
  const [account, setAccount] = useAtom(accountAtom);

  const { hasCopied, onCopy } = useClipboard();

  const { toast } = useToast();

  useEffect(() => {
    const fn = async () => {
      const res = await IsTestnetEnabled();
      setIsTestnet(res);
      const version = await GetCurrentVersion();
      setCurrentVersion(version);
    };
    fn();

    EventsOn("update-progress", (p) => {
      const percentage = Math.floor(p * 100);
      if (percentage > progress) {
        setProgress(percentage);
      }
    });

    return () => {
      EventsOff("update-progress");
    };
  }, []);

  const installApplets = async () => {
    try {
      const _ = await Install();
      toast({
        title: "Success!",
        description: "Applets are installed.",
      });
      setShowSidebarItem("");
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  const resetCardAndWallet = async () => {
    try {
      const _ = await ResetCard(account.id, pin);
      toast({
        title: "Success!",
        description: "Card and wallet is reset.",
      });
      setShowSidebarItem("");
      setAccount({ id: -1, name: "" });
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  const unpairAndClearData = async () => {
    try {
      const _ = await ClearData(account.id, pin);
      toast({
        title: "Success!",
        description: "Card is unpaired.",
      });
      setShowSidebarItem("");
      setAccount({ id: -1, name: "" });
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  const walletReset = async () => {
    try {
      const _ = await ResetWallet();
      toast({
        title: "Success!",
        description: "Wallet is reset.",
      });
      setShowSidebarItem("");
      window.location.reload();
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  const checkUpdates = async () => {
    setCheckVersionLoading(true);
    try {
      const res = await CheckUpdates();
      if (res.shouldUpdate) {
        setLatestVersion(res.latestVersion);
      } else {
        toast({
          title: "No updates available.",
          description: `Current version: ${res.currentVersion}`,
        });
      }
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
    setCheckVersionLoading(false);
  };

  const doUpdate = async () => {
    try {
      await DoUpdate();
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  const setNetwork = async (checked: boolean) => {
    try {
      await EnableTestnet(checked);
      setIsTestnet(checked);
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  const updateAlert = () => {
    return (
      <div className="flex flex-row items-center gap-3 justify-between relative w-full rounded-lg border p-4 bg-green-300">
        <div className="flex flex-row gap-3">
          <Rocket className="h-4 w-4" />
          <div className="flex flex-col">
            <h5 className="mb-1 font-medium leading-none tracking-tight">
              Update available!
            </h5>
            <Label className="text-sm [&_p]:leading-relaxed">
              Latest version: {latestVersion}
            </Label>
          </div>
        </div>
        {progress > 0 && <Progress className="w-1/3" value={progress} />}
        <Button className="" onClick={doUpdate} disabled={progress > 0}>
          Install
        </Button>
      </div>
    );
  };

  const SettingTab = (
    desc: string,
    btnDesc: string,
    confirmDesc: string,
    confirmHandle: () => void,
    requirePin: boolean = true
  ) => {
    return (
      <div className="flex flex-col gap-4">
        <Label className="mt-2 text-sm">{desc}</Label>
        <Dialog>
          <DialogTrigger className="self-start">
            <Button>{btnDesc}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>{confirmDesc}</DialogDescription>
            </DialogHeader>

            {requirePin && (
              <div className="flex flex-row gap-2 items-center justify-start">
                <Label htmlFor="pin" className="text-right">
                  PIN
                </Label>
                <Input
                  id="pin"
                  type="password"
                  className="w-fit"
                  onChange={(e) => setPin(e.target.value)}
                />
              </div>
            )}

            <DialogFooter className="">
              <DialogClose asChild>
                <Button
                  type="button"
                  className="bg-gray-200 text-primary hover:bg-gray-300"
                >
                  Close
                </Button>
              </DialogClose>
              <Button
                className="bg-red-500 hover:bg-red-600 text-secondary"
                onClick={confirmHandle}
              >
                {btnDesc}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="flex flex-col mt-6 ml-20 mr-20 gap-8 flex-grow items-center">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold">Settings</h1>
      </div>

      <div className="flex flex-col gap-2 w-2/3">
        <h2 className="text-xl font-semibold">General</h2>
        <div className="flex flex-col gap-6 border-solid border-2 p-4 rounded-xl">
          {latestVersion && updateAlert()}
          <div className="flex flex-row gap-5 items-center justify-between">
            <Label className="font-semibold">
              Your App Version:{" "}
              <span className="font-bold text-primary">{currentVersion}</span>
            </Label>

            <Button
              className="w-[150px]"
              onClick={checkUpdates}
              disabled={checkVersionLoading}
            >
              {checkVersionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Check Updates"
              )}
            </Button>
          </div>

          <div className="flex items-center space-x-2 justify-between">
            <Label className="font-semibold mr-2" htmlFor="testnet-mode">
              Enable test networks
            </Label>
            <Switch
              id="testnet-mode"
              onCheckedChange={setNetwork}
              checked={isTestnet}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-2/3">
        <h2 className="text-xl font-semibold">Advanced</h2>
        <div className="border-solid border-2 p-4 rounded-xl">
          <div className="flex flex-col gap-2">
            <Tabs defaultValue="unpair" className="w-[400px]">
              <TabsList className="grid h-auto p-1 grid-cols-3 bg-gray-200 rounded-lg">
                <TabsTrigger className="text-md rounded-lg" value="unpair">
                  Unpair
                </TabsTrigger>
                <TabsTrigger className="text-md rounded-lg" value="reset">
                  Reset
                </TabsTrigger>
                <TabsTrigger className="text-md rounded-lg" value="install">
                  Install
                </TabsTrigger>
              </TabsList>
              <TabsContent value="unpair">
                {SettingTab(
                  `Unpair will remove the pairing information on this device.
                  Only unpair if you have other paired devices.`,
                  "Unpair",
                  `This action cannot be undone. This will permanently
                  remove the pairing information on this device. Make
                  sure you have other paired devices, otherwise you will
                  lose access to your card.`,
                  unpairAndClearData
                )}
              </TabsContent>
              <TabsContent value="reset">
                {SettingTab(
                  `Reset will delete the private key on the connected card.
                  Only reset the card if you have the recovery phrase.`,
                  "Reset",
                  `This action cannot be undone. This will permanently
                  remove the private key on the hardware wallet. Make
                  sure you have the recovery phrase, otherwise you will
                  lose access to your crypto assets.`,
                  resetCardAndWallet
                )}
              </TabsContent>
              <TabsContent value="install">
                {SettingTab(
                  `Install applets will delete the private key and existing applets on the connected card.
                  Only install the new applets if you have the recovery phrase.`,
                  "Install Applets",
                  `This action cannot be undone. 
                  It will clear your existing private key and install new applets on your card. 
                  Make sure you have the recovery phrase, otherwise you will lose access to your crypto assets.`,
                  installApplets,
                  false
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

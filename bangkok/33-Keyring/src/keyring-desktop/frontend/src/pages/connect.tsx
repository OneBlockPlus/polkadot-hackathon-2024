import {
  CheckCardConnection,
  CheckCardInitialized,
} from "@/../wailsjs/go/main/App";
import InitializeDialog from "@/components/initialize";
import PairDialog from "@/components/pair";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Settings from "@/pages/settings";
import { showSidebarItem } from "@/store/state";
import { useAtom } from "jotai";
import { ArrowLeftCircle, Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";

function ConnectPage() {
  const [cardInitialized, setCardInitialized] = useState<boolean>(false);
  const [connectDialog, setConnectDialog] = useState(false);

  const [showSettings, setShowSettings] = useAtom(showSidebarItem);

  const { toast } = useToast();

  const connect = async () => {
    try {
      const res = await CheckCardConnection();
      if (res) {
        const res = await CheckCardInitialized();
        setCardInitialized(res);
        setConnectDialog(true);
      } else {
        toast({
          description:
            "Card is not detected, make sure it's connected via card reader and try again.",
        });
      }
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  return (
    <div className="flex flex-row justify-evenly h-screen">
      {connectDialog && cardInitialized === false && (
        <InitializeDialog handleClose={setConnectDialog} />
      )}
      {connectDialog && cardInitialized === true && (
        <PairDialog handleClose={setConnectDialog} />
      )}
      {!showSettings && (
        <>
          <div className="flex flex-col justify-center items-center w-1/2">
            <h1 className="text-3xl font-semibold text-primary">
              Keyring Wallet
            </h1>
            <h2 className="mt-4 text-6xl font-medium text-primary">Welcome!</h2>
          </div>
          <div className="flex flex-col bg-gray-300 justify-center items-center w-1/2">
            <Button className="text-2xl w-auto h-auto" onClick={connect}>
              Connect your Keyring Card
            </Button>
          </div>

          <div className="fixed right-6 bottom-6">
            <SettingsIcon onClick={() => setShowSettings("settings")} />
          </div>
        </>
      )}

      {showSettings && (
        <>
          <ArrowLeftCircle
            className="absolute top-6 left-10"
            width={36}
            height={36}
            onClick={() => setShowSettings("")}
          />
          <div className="w-full ml-10">
            <Settings />
          </div>
        </>
      )}
    </div>
  );
}

export default ConnectPage;

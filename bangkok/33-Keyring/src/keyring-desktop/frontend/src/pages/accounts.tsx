import {
  CheckCardConnection,
  CheckCardInitialized,
  GetAllAccounts,
  GetCredentials,
  SwitchAccount,
  UpdateAccountName,
} from "@/../wailsjs/go/main/App";
import { main } from "@/../wailsjs/go/models";
import InitializeDialog from "@/components/initialize";
import { LogoImageSrc } from "@/components/logo";
import PairDialog from "@/components/pair";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useClipboard } from "@/hooks/useClipboard";
import { errToast } from "@/lib/utils";
import { accountAtom, showSidebarItem } from "@/store/state";
import { useAtom, useSetAtom } from "jotai";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

const Accounts = () => {
  const [name, setName] = useState("");
  const [cardInitialized, setCardInitialized] = useState(false);
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [allAccounts, setAllAccounts] = useState<main.CardInfo[]>([]);
  const [switchToCard, setSwitchToCard] = useState("");
  const [credentials, setCredentials] = useState<
    main.CardCredential | undefined
  >(undefined);

  const setSidebarItem = useSetAtom(showSidebarItem);
  const [account, setAccount] = useAtom(accountAtom);

  const { toast } = useToast();

  const { hasCopied, onCopy } = useClipboard();

  useEffect(() => {
    GetAllAccounts()
      .then((res) => {
        setAllAccounts(res);
      })
      .catch((err) => {
        toast({
          title: "Uh oh! Something went wrong.",
          description: `Error happens: ${err}`,
        });
      });
  }, [showAddCardDialog]);

  const updateAccountName = async () => {
    try {
      if (name !== "") {
        await UpdateAccountName(account.id, name);
        setAccount({ ...account, name });
      }
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  const addCard = async () => {
    try {
      const res = await CheckCardConnection();
      if (res) {
        const res = await CheckCardInitialized();
        setCardInitialized(res);
        setShowAddCardDialog(true);
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

  const handleSwitch = async () => {
    try {
      if (switchToCard !== "" && switchToCard !== account.id.toString()) {
        const res = await SwitchAccount(parseInt(switchToCard));
        setAccount(res);
        setSidebarItem("");
      } else {
        toast({
          description: "Please select a different card.",
        });
      }
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  const addNewCardDialog = () => {
    return cardInitialized ? (
      <PairDialog handleClose={setShowAddCardDialog} />
    ) : (
      <InitializeDialog handleClose={setShowAddCardDialog} />
    );
  };

  const getCredentials = async () => {
    try {
      const res = await GetCredentials(account.id);
      setCredentials(res);
    } catch (err) {
      errToast(err);
    }
  };

  const showCredentialsQRcode = () => (
    <Dialog open={true} onOpenChange={() => setCredentials(undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Credentials</DialogTitle>
          <DialogDescription>
            Please only share the pairing credentials with trusted devices.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-row gap-3 items-start">
          <QRCodeSVG
            value={JSON.stringify(credentials)}
            size={128}
            imageSettings={{
              src: LogoImageSrc,
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
          <Button
            className="w-1/5 rounded-3xl"
            onClick={() => onCopy(JSON.stringify(credentials))}
          >
            <Label>Copy </Label>
            {hasCopied ? <ClipboardCheck /> : <Clipboard />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-col mt-6 ml-20 mr-20 gap-8 items-center flex-grow">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold">Cards</h1>
      </div>

      <div className="flex flex-col gap-2 w-2/3">
        <h2 className="text-xl font-semibold">Manage Selected Card</h2>
        <div className="flex flex-col gap-6 border-solid border-2 p-6 rounded-xl">
          <div className="flex flex-row items-center justify-between">
            <Label className="font-semibold">Change card name</Label>
            <div className="flex flex-row gap-5">
              <Input
                className="w-[150px]"
                onChange={(e) => setName(e.target.value)}
                placeholder="input a new name"
                autoCorrect="off"
                defaultValue={account.name}
              />
              <Button className="w-[130px]" onClick={updateAccountName}>
                Change
              </Button>
            </div>
          </div>

          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col">
              <Label className="font-semibold">Pair with a new device</Label>
              <Label className="font-light text-sm">
                Input the pairing credentials in another device.
              </Label>
            </div>
            <Button className="w-[133px]" onClick={getCredentials}>
              Get credentials
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-2/3">
        <h2 className="text-xl font-semibold">Manage Other Cards</h2>
        <div className="flex flex-col gap-6 border-solid border-2 p-6 rounded-xl">
          <div className="flex flex-row items-center justify-between">
            <Label className="font-semibold">Choose another card</Label>
            <div className="flex flex-row gap-5">
              <Select onValueChange={(v) => setSwitchToCard(v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="select card" />
                </SelectTrigger>
                <SelectContent>
                  {allAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="w-[130px]" onClick={handleSwitch}>
                Confirm
              </Button>
            </div>
          </div>

          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col">
              <Label className="font-semibold">Add a new card</Label>
              <Label className="font-light text-sm">
                Make sure the new card is connected.
              </Label>
            </div>

            <Button className="w-[130px]" onClick={addCard}>
              Add Card
            </Button>
          </div>
        </div>
      </div>
      {showAddCardDialog && addNewCardDialog()}
      {credentials && showCredentialsQRcode()}
    </div>
  );
};

export default Accounts;

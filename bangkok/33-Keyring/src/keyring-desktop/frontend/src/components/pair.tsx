import { Pair } from "@/../wailsjs/go/main/App";
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
import { toast } from "@/components/ui/use-toast";
import { accountAtom } from "@/store/state";
import { useSetAtom } from "jotai";
import { ChangeEvent, useState } from "react";

type Props = {
  handleClose: (open: boolean) => void;
};

const PairDialog = ({ handleClose }: Props) => {
  const [pin, setPin] = useState("");
  const [cardName, setCardName] = useState("");
  const [puk, setPuk] = useState("");
  const [pairingCode, setPairingCode] = useState("");

  const setAccount = useSetAtom(accountAtom);

  const setCredentials = (e: ChangeEvent<HTMLInputElement>) => {
    let credentials = JSON.parse(e.target.value);
    setPuk(credentials.puk);
    setPairingCode(credentials.code);
  };

  const pair = async () => {
    try {
      const res = await Pair(pin, puk, pairingCode, cardName);
      setAccount(res);
      toast({
        title: "Success!",
        description: "Card is paired.",
      });
      handleClose(false);
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Great! Your card is alread initialized.</DialogTitle>
          <DialogDescription>
            You need to input the PIN to connect to the card.
          </DialogDescription>
          <DialogDescription>
            Remove the card if you want to connect another one.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="pin" className="text-right">
            PIN
          </Label>
          <Input
            id="pin"
            type="password"
            className="col-span-3"
            onChange={(e) => setPin(e.target.value)}
          />

          <Label htmlFor="name" className="text-right">
            Card Name
          </Label>
          <Input
            id="name"
            className="col-span-3"
            onChange={(e) => setCardName(e.target.value)}
            autoCorrect="off"
          />

          <Label htmlFor="credential" className="text-right">
            Pairing Credential
          </Label>
          <Input
            id="credential"
            className="col-span-3"
            onChange={setCredentials}
          />
        </div>
        <DialogFooter>
          <Button type="submit" onClick={pair}>
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PairDialog;

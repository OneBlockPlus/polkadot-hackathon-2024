import { GetChainConfigs, RemoveLedger } from "@/../wailsjs/go/main/App";
import { main } from "@/../wailsjs/go/models";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  accountAtom,
  chainConfigsAtom,
  isTestnetAtom,
  refreshAtom,
  showNewLedgerAtom,
  showSidebarItem,
} from "@/store/state";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { FlaskRound, Plus, Settings, Trash2, WalletCards } from "lucide-react";
import Logo from "./logo";
import SidebarIcon from "./sidebar-icon";
import SidebarLedger from "./sidebar-ledger";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";

type Props = {
  chains: main.ChainDetail[];
  lastSelectedChain: string;
};

const Sidebar = ({ chains, lastSelectedChain }: Props) => {
  const setShowNewLedger = useSetAtom(showNewLedgerAtom);
  const setChainConfigs = useSetAtom(chainConfigsAtom);
  const [sidebarItem, setSidebarItem] = useAtom(showSidebarItem);
  const allowTestnet = useAtomValue(isTestnetAtom);
  const account = useAtomValue(accountAtom);
  const setRefresh = useSetAtom(refreshAtom);

  const { toast } = useToast();

  const clickAddButton = async () => {
    let chainConfigs = await GetChainConfigs();
    setChainConfigs(chainConfigs);
    setShowNewLedger(true);
  };

  const deleteChain = async (chainName: string) => {
    try {
      await RemoveLedger(account.id, chainName);
      setRefresh(true);
    } catch (err) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: `Error happens: ${err}`,
      });
    }
  };

  const showledgerItem = (chain: main.ChainDetail) => {
    const isSelected = lastSelectedChain == chain.name;
    if (!chain.testnet) {
      return (
        <ContextMenu key={chain.name}>
          <ContextMenuTrigger>
            <SidebarLedger
              img={chain.img}
              text={chain.name}
              ledger={chain.name}
              selected={isSelected}
            />
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => deleteChain(chain.name)}>
              <Label>Delete</Label>
              <Trash2 className="ml-auto" />
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      );
    }

    if (!allowTestnet) {
      return;
    }

    return (
      <ContextMenu key={chain.name}>
        <ContextMenuTrigger>
          <div className="relative group">
            <SidebarLedger
              img={chain.img}
              text={chain.name}
              ledger={chain.name}
              selected={isSelected}
            />
            <FlaskRound className="absolute top-0 right-0 h-4 w-4 text-primary-foreground" />
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => deleteChain(chain.name)}>
            <Label>Delete</Label>
            <Trash2 className="ml-auto" />
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <div
      className="
            w-auto h-screen p-2
            flex flex-col bg-gray-100 dark:bg-gray-900 shadow-lg
            items-center
            "
    >
      <div>
        <SidebarIcon
          icon={Logo}
          text="Keyring"
          onClick={() => console.log("click")}
        />
      </div>

      <Divider />

      <ScrollArea>{chains.map(showledgerItem)}</ScrollArea>

      {chains.length > 0 && <Divider />}

      <div>
        <SidebarIcon
          icon={Plus}
          text="Add a Blockchain"
          onClick={clickAddButton}
        />
      </div>

      <div className="flex flex-col mt-auto">
        <SidebarIcon
          icon={WalletCards}
          text="Cards"
          onClick={() =>
            sidebarItem == "accounts"
              ? setSidebarItem("")
              : setSidebarItem("accounts")
          }
        />
        <SidebarIcon
          icon={Settings}
          text="Settings"
          onClick={() =>
            sidebarItem == "settings"
              ? setSidebarItem("")
              : setSidebarItem("settings")
          }
        />
      </div>
    </div>
  );
};

const Divider = () => (
  <hr
    className="
        bg-gray-200 dark:bg-gray-800
        border border-gray-200 dark:border-gray-800 rounded-full
        mx-2 w-4/5
        "
  />
);

export default Sidebar;

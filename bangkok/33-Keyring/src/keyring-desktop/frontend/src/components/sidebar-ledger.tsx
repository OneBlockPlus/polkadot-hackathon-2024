import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ledgerAtom, showSidebarItem } from "@/store/state";
import { useSetAtom } from "jotai";
import { LucideIcon } from "lucide-react";
import React from "react";

type Props = {
  img?: string;
  icon?: LucideIcon;
  text: string;
  ledger?: string;
  selected: boolean;
};

const SidebarLedger = ({ img, icon, text, ledger, selected }: Props) => {
  const setLedger = useSetAtom(ledgerAtom);
  const setShowSidebarItem = useSetAtom(showSidebarItem);

  return (
    <div
      className={cn(
        "relative h-14 w-14 mt-2 mb-2 bg-gray-100 hover:bg-primary dark:bg-gray-800 text-zinc-600 hover:text-white hover:rounded-xl rounded-full transition-all duration-200 ease-linear cursor-pointer shadow-lg",
        selected ? "bg-primary rounded-xl" : ""
      )}
      onClick={() => {
        setLedger((oldLedger) => (ledger ? ledger : oldLedger));
        setShowSidebarItem("ledger");
      }}
    >
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger>
            {icon ? React.createElement(icon) : <img src={img} />}
          </TooltipTrigger>
          <TooltipContent
            side="left"
            className="bg-primary text-secondary font-bold ml-2"
          >
            <p>{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SidebarLedger;

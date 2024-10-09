import { LucideIcon } from "lucide-react";
import React from "react";

type Props = {
  icon: LucideIcon;
  text: string;
  onClick: () => void;
};

const SidebarIcon = ({ icon, text, onClick }: Props) => {
  return (
    <div
      className="
            relative flex items-center justify-center
            h-14 w-14 mt-2 mb-2 mx-auto
            bg-secondary hover:bg-primary dark:bg-gray-800
            text-zinc-600 hover:text-white
            hover:rounded-xl rounded-full
            transition-all duration-100 ease-linear
            cursor-pointer shadow-lg
            group
            "
      onClick={onClick}
    >
      {React.createElement(icon)}
      <span
        className="
            absolute w-auto p-2 m-2 min-w-max left-16 rounded-md shadow-md
            text-secondary bg-primary
            text-sm font-bold
            transition-all duration-300 scale-0 origin-left group-hover:scale-100
            "
      >
        {text}
      </span>
    </div>
  );
};

export default SidebarIcon;

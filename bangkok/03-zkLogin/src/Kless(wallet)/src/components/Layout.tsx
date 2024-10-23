import { cn } from "@/lib/utils";
import { ArrowLeft, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export const Layout = ({
  children,
  type = "home",
  title,
}: {
  children: React.ReactNode;
  type?: "home" | "back" | "approve" | "backToSettings";
  title?: string;
}) => {
  return (
    <div className="relative bg-white rounded flex flex-col flex-nowrap items-center justify-center overflow-hidden shadow-lg w-popup-width h-popup-height">
      <div
        className={cn(
          "h-14 absolute top-0 left-0 text-xl flex items-center px-4 py-3 justify-between w-full",
          {
            "border-b": type === "home",
          }
        )}
      >
        {type === "backToSettings" && (
          <div className="select-none flex justify-center items-center w-full">
            <Link className="absolute left-4 bottom-4" to="/settings">
              <ArrowLeft />
            </Link>
            <div className="text-center">{title}</div>
          </div>
        )}
        {type === "back" && (
          <div className="select-none flex justify-center items-center w-full">
            <Link className="absolute left-4 bottom-4" to="/home">
              <ArrowLeft />
            </Link>
            <div className="text-center">{title}</div>
          </div>
        )}
        {type === "home" && (
          <div className="select-none flex items-center w-full">
            <div className="text-center">Kless Wallet</div>
            <Link className="absolute right-4 bottom-4" to="/settings">
              <Settings />
            </Link>
          </div>
        )}
        {type === "approve" && (
          <div className="select-none flex justify-center items-center w-full">
            <div className="text-center">{title}</div>
          </div>
        )}
      </div>

      <div className="mt-14 rounded-xl flex flex-col overflow-auto w-full h-full">
        {children}
      </div>
    </div>
  );
};

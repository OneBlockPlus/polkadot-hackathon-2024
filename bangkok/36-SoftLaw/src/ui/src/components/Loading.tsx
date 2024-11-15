import { Loader } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 bg-[#1C1A11]/80 flex items-center justify-center z-50">
      <div className="bg-[#252525] p-8 rounded-lg shadow-lg flex flex-col items-center gap-4">
        <div className="relative">
          <Loader className="w-12 h-12 animate-spin text-[#FACC15]" />
          <div className="absolute top-0 left-0 w-full h-full animate-ping rounded-full bg-[#FACC15]/20" />
        </div>
        <p className="text-[#D0DFE4] font-Montserrat text-lg">Processing...</p>
      </div>
    </div>
  );
};

export default Loading;
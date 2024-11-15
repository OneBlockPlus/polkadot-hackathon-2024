import { useInnovationContext } from "@/context/innovation";
import MintNftUnique from "./mintUnique";

export const ChainSelector = () => {
    const { chain, setChain } = useInnovationContext();
  
    type ChainType = "unique" | "softlaw";

    const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setChain(e.target.value as ChainType);
    };
    
  
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[#D0DFE4]">Select Network</label>
          <select
            value={chain}
            onChange={handleChainChange}
            className="text-[20px] min-[2000px]:text-2xl flex min-[2000px]:w-5/6 w-full mt-[6px] h-auto text-[#fff] p-3 items-start gap-[10px] self-stretch bg-[#27251C] outline-none border-none focus:outline-none pr-10 rounded-md focus:ring-1 focus:ring-[#FACC15] min-w-[280px]"
          >
            <option value="unique">Unique Network</option>
            <option value="softlaw">Softlaw</option>
          </select>
        </div>
  
        <div className="mt-4">
          {chain === "softlaw" && (
            <button 
              className="bg-[#D0DFE4] min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl w-[128px] min-[2000px]:w-[200px] items-center text-center rounded-[16px] text-[#1C1A11] px-[22px] py-[8px] flex-shrink-0 hover:bg-[#FACC15]"
              onClick={() => {/* tu lógica para mint con softlaw */}}
            >
              MINT WITH SOFTLAW
            </button>
          )}
          {chain === "unique" && <MintNftUnique />}
        </div>
      </div>
    );
  };
  
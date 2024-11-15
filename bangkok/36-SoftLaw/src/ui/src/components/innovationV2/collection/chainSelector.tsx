import { useInnovationContext } from "@/context/innovation";
import MintUniqueCollection from "./mintUnique";
import MintSoftlawCollection from "./mintSoftlaw";


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
            <MintSoftlawCollection/>
          )}
          {chain === "unique" && <MintUniqueCollection/>}
        </div>
      </div>
    );
  };
  
"use client"
import { ContractIds } from "@/deployments/deployments";
import { contractTxWithToast } from "@/utils/contract-tx-with-toast";
import { useInkathon, useRegisteredContract } from "@scio-labs/use-inkathon";
import { useEffect, useState } from "react"
import toast from "react-hot-toast";

type PositionCardProps = {
    type: string, id: number, value: number, leverage: number, amount: number, date: number, refetchPosition:  any
}


export default function PositionCard({type, id, value, leverage, amount, date, refetchPosition}:PositionCardProps) { 
    const [updateState, setUpdateState] = useState(false);
    const [expanded, setExpanded]= useState(false)
    const [updatedAmount, setUpdatedAmount] = useState<any>(0);
    const { api, activeAccount, activeSigner } = useInkathon();
    const { contract, address: contractAddress } = useRegisteredContract(
      ContractIds.Manager,
      "pop-network-testnet",
    );
    

    // Open Position
  const updatePosition= async () => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error("Wallet not connected. Try again…");
      return;
    }
  
    try {
        
      await contractTxWithToast(
        api,
        activeAccount.address,
        contract,
        "updatePosition",
        {},
        [updatedAmount, id, "15ypQ3FwDomkjWVv4DhgixaBehXN8NNgfbgaEn3LuW3Ey47w"],
      );
      refetchPosition()
    } catch (e) {
      console.error(e);
    } 
}
    return ( <div className="w-full min-h-[50px] h-fit shrink-0 flex flex-col py-3 px-6 bg-gray-500/30 rounded-2xl">
        <div className="w-full h-fit flex justify-between border-b border-b-slate-400/60 py-2 items-center flex-row gap-1">
             <p className="text-white/60 font-medium">ID:</p>
             {id}
             </div>
             {expanded ? <>
             <div className="w-full flex justify-between border-b border-b-slate-400/60 py-2 items-center flex-row gap-1">
             <p className="text-white/60 font-medium">Type:</p>
             {type.toUpperCase()}
             </div>
             <div className="w-full flex justify-between border-b border-b-slate-400/60 py-2 items-center flex-row gap-1">
             <p className="text-white/60 font-medium">Value:</p>
             {value}
             </div>
             <div className="w-full flex justify-between border-b border-b-slate-400/60 py-2 items-center flex-row gap-1">
             <p className="text-white/60 font-medium">Leverage:</p>
             {leverage}
             </div>
             <div className="w-full flex justify-between border-b border-b-slate-400/60 py-2 items-center flex-row gap-1">
             <p className="text-white/60 font-medium">Amount:</p>
             {amount}
             </div>
             <div className="w-full flex justify-between border-b border-b-slate-400/60 py-2 items-center flex-row gap-1">
             <p className="text-white/60 font-medium">Date:</p>
             {new Date(date).toDateString()}
             </div>
             <div className="w-full flex justify-start py-2 items-center flex-col gap-1">
                {updateState && <>
                
                <p className="text-white/60">Input new amount below:</p>
                <input onChange={(e: any) => setUpdatedAmount(e.target.value || 0)} value={updatedAmount || ''}  className="rounded-sm bg-slate-50/70 text-black w-full placeholder:text-black/60 px-2" placeholder="0" />
                <button onClick={()=> updatePosition()} disabled={updatedAmount !== 0 && false} className={`mt-2  transition duration-200 font-medium border border-slate-900 ${updatedAmount !== 0 ? 'bg-white/80 hover:opacity-70': 'bg-white/10'} rounded-lg text-slate-900 w-full`}>Update</button>
                </>}
             <button className={` hover:opacity-70 transition duration-200  ${updateState? 'w-fit' : 'font-medium border border-slate-900 bg-white/80 rounded-lg text-slate-900 w-full '}`} onClick={() => setUpdateState((update) => !update)}>{updateState ? 'Cancel' :"Update"}</button>
             <button onClick={() => setExpanded((prev) => !prev)} className="text-white/60 pt-3 flex flex-row gap-1 items-center" >Collapse <div className="rotate-90 text-white">{`<`}</div></button>
             </div></>: <button onClick={() => setExpanded((prev) => !prev)} className="text-white/60 pt-3 flex flex-row gap-1 items-center" >Expand <div className="rotate-90 text-white">{`>`}</div></button>}
         </div> )
}
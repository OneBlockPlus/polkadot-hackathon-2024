'use client'
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { GreeterContractInteractions } from "../web3/oracle-contract-interactions";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useInkathon, useRegisteredContract } from "@scio-labs/use-inkathon";
import { ContractIds } from "@/deployments/deployments";
import { contractTxWithToast } from "@/utils/contract-tx-with-toast";

export default function PositionDoing(refetchPosition: any) {
    const { error } = useInkathon();
    const [form, setForm] = useState<{amount?: number, leverage?: number, tokenId?: number}>()
    const { api, activeAccount, activeSigner } = useInkathon();
    const { contract, address: contractAddress } = useRegisteredContract(
      ContractIds.Manager,
      "pop-network-testnet",
    );
    
    // On input change
    function onChange(event: any) {
    setForm({...form, [event.target.name]: Number(event.target.value) });
    }


  useEffect(() => {
    if (!error) return;
    toast.error(error.message);
  }, [error]);

    // Open Position
  const openPosition= async (positionType:string) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error("Wallet not connected. Try again…");
      return;
    }
  
    try {
        
      await contractTxWithToast(
        api,
        activeAccount.address,
        contract,
        "openPosition",
        {},
        [form?.tokenId, form?.amount, positionType, form?.leverage, "15ypQ3FwDomkjWVv4DhgixaBehXN8NNgfbgaEn3LuW3Ey47w"],
      );
      refetchPosition()
    } catch (e) {
      console.error(e);
    } 
  };


    return <>
       <p className="text-sm opacity-85">Token ID:</p>
       <Input name="tokenId" value={form?.tokenId || ''} onChange={(e) => onChange(e)} type="number" />
     <p className="text-sm opacity-85">Amount</p>
          <Input name="amount" value={form?.amount || ''} onChange={(e) => onChange(e)} type="number" />
          <p className="mt-3 text-sm opacity-85">Leverage</p>
          <Input name="leverage" value={form?.leverage || ''} onChange={(e) => onChange(e)} type="number" />
          <div className="mt-6 flex w-full flex-row gap-2">
            <Button onClick={() => openPosition('LONG')} variant="default" className="min-h-12 w-full bg-green-700">
              LONG
            </Button>
            <div className="h-12 w-1 bg-gray-500"></div>
            <Button  onClick={() => openPosition('SHORT')} variant="default" className="min-h-12 w-full bg-red-800">
              SHORT
            </Button>
          </div>
          <GreeterContractInteractions />
          </>
}


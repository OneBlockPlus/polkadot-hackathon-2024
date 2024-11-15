import { useToast } from "@/hooks/use-toast";
import { useInnovationContext } from "@/context/innovation";
import { getSoftlawApi } from "@/utils/softlaw/getApi";
import { useAccountsContext } from "@/context/account";
import { createCollection } from "@/utils/softlaw/mintCollection";
import { useState } from "react";
import { ApiPromise } from "@polkadot/api";

interface CollectionResult {
  collectionId: string;
  creator: string;
  owner: string;
  blockHash: string;
}

export default function MintSoftlawCollection() {
  const { collection, loading, setLoading, collectionMetadata } =
    useInnovationContext();

  const { selectedAccount } = useAccountsContext();
  const [collectionCreated, setCollectionCreated] =
    useState<CollectionResult | null>(null);
  const { toast } = useToast();

  const validatePrerequisites = (): boolean => {
    if (!collection?.name || !collection?.description || !collection?.image) {
      toast({
        title: "Select a Collection",
        description: "Please provide all collection details.",
        variant: "destructive",
      });
      return false;
    }

    if (!selectedAccount) {
      toast({
        title: "Connect your Wallet",
        description: "Please connect your wallet and select an account.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleCreateColl = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    if (!validatePrerequisites() || !selectedAccount) {
      return;
    }

    try {
      setLoading(true);

      const api = await getSoftlawApi();
      // Antes de crear la transacción
      console.log("Chain info:", {
        specName: api.runtimeVersion.specName.toString(),
        specVersion: api.runtimeVersion.specVersion.toString(),
        metadata: api.runtimeMetadata.version,
      });

      // Verificar el balance
      // const { data: balance } = await api.query.system.account(selectedAccount.address);
      // console.log("Account balance:", balance.toHuman());

      // Crear colección
      const result = await createCollection(api, selectedAccount);
      console.log("Collection created successfully:", result);


      setCollectionCreated(result);
      toast({
        title: "Collection Created Successfully",
        description: `Collection ID: ${result.collectionId}`,
        variant: "default",
        className: "bg-white text-black border border-gray-200",
      });
      
    } catch (error) {
      console.error("Error creating collection:", error);
      toast({
        title: "Error Creating Collection",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        className={`
          bg-[#D0DFE4] text-[#1C1A11] px-6 py-2 rounded-lg 
          hover:bg-[#FACC15] transition-colors 
          disabled:opacity-50 disabled:cursor-not-allowed
          ${loading ? "cursor-wait" : ""}
        `}
        onClick={handleCreateColl}
        disabled={loading}
      >
        {loading ? "Creating Collection..." : "Mint Collection with Softlaw"}
      </button>
    </div>
  );
}

import React, { createContext, useContext, useState, ReactNode } from "react";

// interface CollectionType {
//   name: string;
//   description: string;
//   prefix: string;
//   image: string;
// }

// interface NftType {
//   name: string;
//   description: string;
//   metadata: string;
// }

interface DashboardContextType {
  selectedTabDashboard: string;
  setSelectedTabDashboard: React.Dispatch<React.SetStateAction<string>>;
  //   collection: CollectionType |null ;
  //   setCollection: React.Dispatch<React.SetStateAction<CollectionType | null>>;
  //   nft: NftType | null;
  //   setNft: React.Dispatch<React.SetStateAction<NftType | null>>;
}

const defaultContextValue: DashboardContextType = {
  selectedTabDashboard: "1",
  setSelectedTabDashboard: () => {},
  //   collection: null,
  //   setCollection: () => {},
  //   nft: null,
  //   setNft: () => {},
};

const DashboardContext =
  createContext<DashboardContextType>(defaultContextValue);

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error(
      "useDashboardContext must be used within an DashboardProvider"
    );
  }
  return context;
}

interface DashboardProviderProps {
  children: ReactNode;
}

export default function DashboardProvider({
  children,
}: DashboardProviderProps) {
  const [selectedTabDashboard, setSelectedTabDashboard] = useState<string>("1");
  //   const [collection, setCollection] = useState<CollectionType | null>(null);
  //   const [nft, setNft] = useState<NftType | null>(null);
  const value: DashboardContextType = {
    selectedTabDashboard,
    setSelectedTabDashboard,
    // collection,
    // setCollection,
    // nft,
    // setNft,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

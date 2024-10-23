import { createContext, useContext, useState, ReactNode } from "react";

interface UniqueContextType {
  collectionAddress: string | null;
  setCollectionAddress: React.Dispatch<React.SetStateAction<string | null>>;
}

const defaultContextValue: UniqueContextType = {
  collectionAddress: null,
  setCollectionAddress: () => {},
};

const UniqueContext = createContext<UniqueContextType>(defaultContextValue);

export function useUnique() {
  const context = useContext(UniqueContext);
  if (context === undefined) {
    throw new Error("useUnique must be used within an UniqueProvider");
  }
  return context;
}

interface UniqueProviderProps {
  children: ReactNode;
}

export default function UniqueProvider({ children }: UniqueProviderProps) {
  const [collectionAddress, setCollectionAddress] = useState<string | null>(
    null
  );

  const value: UniqueContextType = {
    collectionAddress,
    setCollectionAddress,
  };

  return (
    <UniqueContext.Provider value={value}>{children}</UniqueContext.Provider>
  );
}

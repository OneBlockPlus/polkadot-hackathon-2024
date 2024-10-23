import { createContext, useContext, useState, ReactNode } from "react";

interface RicardianContextType {
  selectedTabRicardian: string;
  setSelectedTabRicardian: React.Dispatch<React.SetStateAction<string>>;
}

const defaultContextValue: RicardianContextType = {
  selectedTabRicardian: "",
  setSelectedTabRicardian: () => {},
};

const RicardianContext = createContext<RicardianContextType>(defaultContextValue);

export function useRicardianContext() {
  const context = useContext(RicardianContext);
  if (context === undefined) {
    throw new Error("useRicardianContext must be used within an RicardianProvider");
  }
  return context;
}

interface RicardianProviderProps {
  children: ReactNode;
}

export default function RicardianProvider({ children }: RicardianProviderProps) {
  const [selectedTabRicardian, setSelectedTabRicardian] = useState<string>("");
  const value:  RicardianContextType = {
    selectedTabRicardian,
    setSelectedTabRicardian,
  };

  return <RicardianContext.Provider value={value}>{children}</RicardianContext.Provider>;
}

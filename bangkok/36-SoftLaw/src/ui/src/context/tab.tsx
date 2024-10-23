import { createContext, useContext, useState, ReactNode } from "react";

interface DashboardTapContextType {
  selectedTabDashboard: string;
  setSelectedTabDashboard: React.Dispatch<React.SetStateAction<string>>;
}

const defaultContextValue: DashboardTapContextType = {
  selectedTabDashboard: "",
  setSelectedTabDashboard: () => {},
};

const DashboardTabContext = createContext<DashboardTapContextType>(defaultContextValue);

export function useDashboardTapContext() {
  const context = useContext(DashboardTabContext);
  if (context === undefined) {
    throw new Error("useDashboardTapContext must be used within an DashboardTabProvider");
  }
  return context;
}

interface DashboardTabProviderProps {
  children: ReactNode;
}

export default function DashboardProvider({ children }: DashboardTabProviderProps) {
  const [selectedTabDashboard, setSelectedTabDashboard] = useState<string>("");
  const value:  DashboardTapContextType = {
    selectedTabDashboard,
    setSelectedTabDashboard,
  };

  return <DashboardTabContext.Provider value={value}>{children}</DashboardTabContext.Provider>;
}

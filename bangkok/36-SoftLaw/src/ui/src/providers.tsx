"use client";
import { ReactNode } from "react";
import AccountsProvider from "./context/account";
import InnovationProvider from "./context/innovation";

// Aquí puedes importar otros providers que necesites

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AccountsProvider>
      <InnovationProvider>
        {/* Otros providers aquí */}
        {children}
      </InnovationProvider>
    </AccountsProvider>
  );
}

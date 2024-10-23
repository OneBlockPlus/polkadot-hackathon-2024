import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { Welcome } from "@/routes/Welcome.tsx";
import "@fontsource/inter";

import "@/interfaces/augment-api";
import "@/interfaces/types-lookup";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import { Updater } from "./Updater.tsx";
import "./global.css";
import { AccountsPage } from "./routes/Accounts.tsx";
import { ApprovalRequestPage } from "./routes/ApprovalRequest.tsx";
import { ExpirePage } from "./routes/Expire.tsx";
import { HomePage } from "./routes/Home.tsx";
import { SettingPage } from "./routes/Setting.tsx";
import { TransferPage } from "./routes/Transfer.tsx";
import { useAppStore } from "./state/store.ts";

const queryClient = new QueryClient();

function renderApp() {
  const rootDom = document.getElementById("root");
  if (!rootDom) {
    throw new Error("Root element not found");
  }
  const root = createRoot(rootDom);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Updater />
          <SnackbarProvider
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
          >
            <Routes>
              <Route path="welcome" element={<Welcome />} />
              <Route path="home" element={<HomePage />} />
              <Route path="send" element={<TransferPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="expire" element={<ExpirePage />} />
              <Route
                path="approve/:requestID"
                element={<ApprovalRequestPage />}
              />
              <Route path="settings" element={<SettingPage />} />
              <Route path="*" element={<Navigate to="home" replace={true} />} />
            </Routes>
          </SnackbarProvider>
        </HashRouter>
      </QueryClientProvider>
    </StrictMode>
  );
}

(async () => {
  const background = useAppStore.getState().background;
  background.init();
  renderApp();
})();

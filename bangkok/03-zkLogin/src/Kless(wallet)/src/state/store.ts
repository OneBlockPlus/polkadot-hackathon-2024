import { BackgroundClient } from "@/background-client";
import { ApprovalRequest } from "@/messaging/messages/payloads/transactions/ApprovalRequest";
import { ApiPromise } from "@polkadot/api";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface AppState {
  api: null | ApiPromise;
  background: BackgroundClient;
  txRequests: ApprovalRequest[];
}

interface AppAction {
  setApi: (value: ApiPromise) => void;
  setTxRequests: (value: ApprovalRequest[]) => void;
  updateRequest: (
    id: string,
    {
      approved,
      txResult,
      txResultError,
    }: {
      approved: boolean;
      txResult?: any;
      txResultError?: any;
    }
  ) => void;
}

export const useAppStore = create(
  immer<AppState & AppAction>((set) => ({
    api: null,
    txRequests: [],
    updateRequest: (id, { approved, txResult, txResultError }) => {
      set((state) => {
        const txRequest = state.txRequests.find(
          (txRequest) => txRequest.id === id
        );
        if (!txRequest) return;
        txRequest.approved = approved;
        txRequest.txResult = txResult;
        txRequest.txResultError = txResultError;
      });
    },
    background: new BackgroundClient(),
    setApi: (value) => set((state) => void (state.api = value)),
    setTxRequests: (value) => set((state) => void (state.txRequests = value)),
  }))
);

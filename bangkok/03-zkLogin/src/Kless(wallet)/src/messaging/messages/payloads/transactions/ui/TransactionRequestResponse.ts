import type { BasePayload, Payload } from "@/messaging/messages/payloads";
import { isBasePayload } from "@/messaging/messages/payloads";

export interface TransactionRequestResponse extends BasePayload {
  type: "transaction-request-response";
  txID: string;
  approved: boolean;
  txResult?: any;
  txResultError?: string;
  txSigned?: any;
}

export function isTransactionRequestResponse(
  payload: Payload
): payload is TransactionRequestResponse {
  return (
    isBasePayload(payload) && payload.type === "transaction-request-response"
  );
}

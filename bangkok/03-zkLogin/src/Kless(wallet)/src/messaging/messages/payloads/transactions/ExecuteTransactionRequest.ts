import type { BasePayload, Payload } from "@/messaging/messages/payloads";
import { isBasePayload } from "@/messaging/messages/payloads";

export interface ExecuteTransactionRequest extends BasePayload {
  type: "execute-transaction-request";
  transaction: any;
}

export function isExecuteTransactionRequest(
  payload: Payload
): payload is ExecuteTransactionRequest {
  return (
    isBasePayload(payload) && payload.type === "execute-transaction-request"
  );
}

export interface SignTransactionRequest extends BasePayload {
  type: "sign-transaction-request";
  transaction: any;
}

export function isSignTransactionRequest(
  payload: Payload
): payload is SignTransactionRequest {
  return isBasePayload(payload) && payload.type === "sign-transaction-request";
}

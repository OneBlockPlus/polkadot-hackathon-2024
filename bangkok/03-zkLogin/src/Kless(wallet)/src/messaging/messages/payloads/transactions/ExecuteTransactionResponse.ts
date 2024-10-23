import { isBasePayload } from "@/messaging/messages/payloads";
import type { BasePayload, Payload } from "@/messaging/messages/payloads";

export interface ExecuteTransactionResponse extends BasePayload {
  type: "execute-transaction-response";
  result: any;
}

export function isExecuteTransactionResponse(
  payload: Payload
): payload is ExecuteTransactionResponse {
  return (
    isBasePayload(payload) && payload.type === "execute-transaction-response"
  );
}

export interface SignTransactionResponse extends BasePayload {
  type: "sign-transaction-response";
  result: any;
}

export function isSignTransactionResponse(
  payload: Payload
): payload is SignTransactionResponse {
  return isBasePayload(payload) && payload.type === "sign-transaction-response";
}

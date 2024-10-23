export type TransactionDataType = {
  type: "transaction";
  data: string;
  account: string;
  justSign?: boolean;
  requestType?: any;
  options?: any;
};

export type SignMessageDataType = {
  type: "sign-message";
  message: string;
  accountAddress: string;
};

export type ApprovalRequest = {
  id: string;
  approved: boolean | null;
  origin: string;
  originFavIcon?: string;
  txResult?: any;
  txResultError?: string;
  txSigned?: any;
  createdDate: string;
  tx: any;
};

export interface SignMessageApprovalRequest
  extends Omit<ApprovalRequest, "txResult" | "tx"> {
  tx: any;
  txResult?: any;
}

export interface TransactionApprovalRequest
  extends Omit<ApprovalRequest, "txResult" | "tx"> {
  tx: any;
  txResult?: any;
}

export function isSignMessageApprovalRequest(
  request: ApprovalRequest
): request is SignMessageApprovalRequest {
  return request.tx.type === "sign-message";
}

export function isTransactionApprovalRequest(
  request: ApprovalRequest
): request is TransactionApprovalRequest {
  return request.tx.type !== "sign-message";
}

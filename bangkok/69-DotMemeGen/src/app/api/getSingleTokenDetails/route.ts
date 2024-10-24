import { NextRequest, NextResponse } from "next/server";
import withErrorHandling from "../../../api-middleware/withErrorHandling";
import { APIError } from "../../../utils/exceptions";
import getReqBody from "../../../utils/getReqBody";
import MESSAGES from "../../../utils/messsages";
import { firestore_db } from "../../../services/firebaseinit";
import { ICoin } from "../../../types";

const network = process.env.PUBLIC_NETWORK;

export const POST = withErrorHandling(async (req: NextRequest) => {
  if (!network) {
    throw new APIError(MESSAGES.INVALID_NETWORK, 400);
  }

  const { token } = await getReqBody(req);

  if (!token?.length) {
    throw new APIError(MESSAGES.INVALID_PARAMS, 400);
  }

  const coinDocRef = await firestore_db.collection("coins").doc(token).get();

  if (!coinDocRef.exists) {
    throw new APIError(MESSAGES.NO_DATA_FOUND, 400);
  }

  const data = coinDocRef?.data();
  const payload: ICoin = {
    createdAt: data?.created_at?.toDate
      ? data?.created_at?.toDate()
      : data?.created_at,
    limit: data?.limit,
    logoImage: data?.logo_image,
    mintCount: data?.minted_addresses?.length || 0,
    mintedByAddresses: data?.minted_addresses || [],
    name: data?.name,
    network: data?.network,
    proposer: data?.proposer,
    title: data?.title,
    totalSupply: data?.total_supply,
    content: data?.content || "",
  };

  return NextResponse.json(payload || []);
});

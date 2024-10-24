import withErrorHandling from "../../../api-middleware/withErrorHandling";
import { APIError } from "../../../utils/exceptions";

import { NextRequest, NextResponse } from "next/server";
import MESSAGES from "../../../utils/messsages";
import getReqBody from "../../../utils/getReqBody";
import { ICoin, LISTING_LIMIT } from "../../../types";
import { firestore_db } from "../../../services/firebaseinit";

const network = process.env.PUBLIC_NETWORK;

export const POST = withErrorHandling(async (req: NextRequest) => {
  if (!network) {
    throw new APIError(MESSAGES.INVALID_NETWORK, 400);
  }

  const { page } = await getReqBody(req);

  if (!page || isNaN(page)) {
    throw new APIError(MESSAGES.INVALID_PARAMS, 400);
  }

  const allCoinsRefSnapshot = await firestore_db
    .collection("coins")
    .limit(LISTING_LIMIT)
    .offset((page - 1) * LISTING_LIMIT)
    .get();
  const allCoinsRefCount = await firestore_db.collection("coins").count().get();

  if (allCoinsRefSnapshot.empty) {
    console.log(allCoinsRefSnapshot.empty, "hereeee");
    throw new APIError(MESSAGES.NO_DATA_FOUND, 400);
  }

  const allCoins: ICoin[] = [];
  allCoinsRefSnapshot.docs?.map((doc) => {
    if (doc?.exists) {
      const data = doc?.data();
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
      };

      allCoins?.push(payload);
    }
  });
  return NextResponse.json({
    data: allCoins || [],
    totalCount: allCoinsRefCount?.data().count || 0,
  });
});

import withErrorHandling from "../../../api-middleware/withErrorHandling";
import { APIError } from "../../../utils/exceptions";

import { NextRequest, NextResponse } from "next/server";
import getReqBody from "../../../utils/getReqBody";
import MESSAGES from "../../../utils/messsages";
import getEncodedAddress from "../../../utils/getEncodedAddress";
import { firestore_db } from "../../../services/firebaseinit";

const network = process.env.PUBLIC_NETWORK;

export const POST = withErrorHandling(async (req: NextRequest) => {
  const { coinName, mintingAddress } = await getReqBody(req);

  if (!network) {
    throw new APIError(MESSAGES.INVALID_NETWORK, 400);
  }

  if (
    !coinName?.length ||
    !mintingAddress?.length ||
    !getEncodedAddress(mintingAddress, network)
  ) {
    throw new APIError(MESSAGES.INVALID_PARAMS, 400);
  }

  const coinRefSnapshot = firestore_db.collection("coins").doc(coinName);
  const coinRefDoc = await coinRefSnapshot?.get();

  if (!coinRefDoc.exists) {
    throw new APIError(MESSAGES.MEME_COIN_DOES_NOT_EXISTS, 400);
  }

  const coinData = coinRefDoc?.data();

  if (
    coinData?.minted_addresses?.includes(
      getEncodedAddress(mintingAddress, network) || mintingAddress,
    )
  ) {
    throw new APIError(MESSAGES.MEME_COIN_ALREADY_MINTED, 400);
  }

  const payload = {
    minted_addresses: [
      ...(coinData?.minted_addresses || []),
      getEncodedAddress(mintingAddress, network) || mintingAddress,
    ],
  };

  await coinRefSnapshot?.update(payload);
  return NextResponse.json({ message: MESSAGES.MEME_COIN_MINTED_SUCCESSFULLY });
});

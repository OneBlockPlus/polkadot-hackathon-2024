import { BN } from "bn.js";
import { NextRequest, NextResponse } from "next/server";
import { APIError } from "../../../utils/exceptions";
import MESSAGES from "../../../utils/messsages";
import withErrorHandling from "../../../api-middleware/withErrorHandling";
import getReqBody from "../../../utils/getReqBody";
import { IFirebaseCoin, ZERO_BN } from "../../../types";
import { firestore_db } from "../../../services/firebaseinit";
import getEncodedAddress from "../../../utils/getEncodedAddress";

const network = process.env.PUBLIC_NETWORK;

export const POST = withErrorHandling(async (req: NextRequest) => {
  if (!network) {
    throw new APIError(MESSAGES.INVALID_NETWORK, 400);
  }

  const { name, totalSupply, title, content, limit, logoImage, proposer } =
    await getReqBody(req);

  if (
    !name?.length ||
    !title?.length ||
    !content?.length ||
    new BN(limit || "0").eq(ZERO_BN) ||
    !logoImage?.length ||
    !proposer?.length ||
    !getEncodedAddress(proposer, network)
  ) {
    throw new APIError(MESSAGES.INVALID_PARAMS, 400);
  }

  const coinRefSnapshot = firestore_db.collection("coins").doc(name);
  const coinRefDoc = await coinRefSnapshot?.get();

  if (coinRefDoc.exists) {
    throw new APIError(MESSAGES.MEME_COIN_ALLREADY_EXISTS, 400);
  }

  const payload: IFirebaseCoin = {
    content: content || "",
    created_at: new Date(),
    limit: limit,
    logo_image: logoImage,
    name: name,
    network: network,
    proposer: getEncodedAddress(proposer, network) || proposer,
    title: title || "",
    total_supply: totalSupply,
  };

  await coinRefSnapshot?.set(payload, { merge: true });

  return NextResponse.json({
    message: MESSAGES.MEME_COIN_CREATED_SUCCESSFULLY,
  });
});

import { ponder } from "@/generated";
import { formatUnits, getAddress } from "viem";
import { DECIMALS } from "../utils/consts";

ponder.on("bookadotFactory:Book", async ({ event, context }) => {
  // @ts-ignore
  const { Book } = context.db;
  const eventData = event.args;

  const tokenAddr = getAddress(eventData.bookingData.token)
  const tokenDecimals = DECIMALS[tokenAddr] || 18;
  const data = {
    property: getAddress(eventData.property),
    bookedTimestamp: Number(eventData.bookedTimestamp),
    checkInTimestamp: Number(eventData.bookingData.checkInTimestamp),
    checkOutTimestamp: Number(eventData.bookingData.checkOutTimestamp),
    balance: Number(formatUnits(eventData.bookingData.balance, tokenDecimals)),
    ticketId: eventData.bookingData.ticketId,
    guest: getAddress(eventData.bookingData.guest),
    token: tokenAddr,
    status: eventData.bookingData.status,
    cancellationPolicies: JSON.stringify(eventData.bookingData.cancellationPolicies.map((policy) => ({
      expiryTime: Number(policy.expiryTime),
      refundAmount: Number(formatUnits(policy.refundAmount, tokenDecimals)),
    }))),
  }

  await Book.create({
    id: eventData.bookingData.id,
    data
  });
});

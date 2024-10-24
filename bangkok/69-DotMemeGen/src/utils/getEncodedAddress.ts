import { encodeAddress } from "@polkadot/util-crypto";
import { chainProperties } from "./networkConstants";

export default function getEncodedAddress(
  address: string,
  network: string,
): string | null {
  const ss58Format = chainProperties?.[network]?.ss58Format;

  if (!address) {
    return null;
  }

  if (!network || ss58Format === undefined) {
    return null;
  }

  const newAddress = address;

  if (newAddress.length) {
    if (newAddress?.startsWith("0x")) return newAddress;
  }

  try {
    return encodeAddress(newAddress, ss58Format);
  } catch (e) {
    console.error("getEncodedAddress error", e);
    return null;
  }
}

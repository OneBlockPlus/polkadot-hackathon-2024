import { getAddress } from "viem"

export const TOKEN_ADDRESS = {
  NATIVE_TOKEN: getAddress("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"),
}

export const DECIMALS = {
  [TOKEN_ADDRESS.NATIVE_TOKEN]: 18,
}


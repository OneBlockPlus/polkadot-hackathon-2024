/*
 * @Descripttion:
 * @version: 1.0
 * @Author: Hesin
 * @Date: 2024-08-24 16:58:24
 * @LastEditors: Hesin
 * @LastEditTime: 2024-08-27 16:55:23
 */
import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: `${process.env.PINATA_JWT}`,
  pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`,
});

export const getPinataData = async (url, callback) => {
  try {
    const newURL = url.replace("ipfs://", "");
    const data = await pinata.gateways.get(newURL);
    // console.log(data);
    callback(data.data);
  } catch (error) {
    console.log(error);
  }
};

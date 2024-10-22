import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import {isValidSignature} from "../../../libs/sign";
import {getJwtSecretKey} from "../../../libs/auth";

export async function POST(request) {
  const body = await request.json();
  // console.log("sign params:", body)

  const {signedMessage, address, signature} = body;
  // console.log("body:", body)
  // console.log("signature:", signature)
  // todo 校验钱包签名
  // if(!isValidSignature(signedMessage, signature, address)){
  //   console.log("钱包签名校验失败:", signature)
  //   return NextResponse.json(
  //       { message: "钱包签名校验失败" },
  //       {
  //         status: 500,
  //       }
  //   );
  // }
  // console.log("钱包签名校验成功:", signature)

  // JWT签名
  const jwtToken = await new SignJWT({
    address: address,
    signature: signature,
    role: "admin", // TODO Set your own roles
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("600s") // Set your own expiration time
    .sign(await getJwtSecretKey());

  // console.log("token:", token)

  // 返回JWT
  const response = NextResponse.json(
    { success: true , token: jwtToken},
    { status: 200, headers: { "content-type": "application/json" } }
  );

  response.cookies.set({
    name: "jwtToken",
    value: jwtToken,
    path: "/",
  });

  // console.log("response:", response)

  return response;

  // return NextResponse.json({ success: false });
}

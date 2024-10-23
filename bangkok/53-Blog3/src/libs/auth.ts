"use server";

import { JWTPayload, jwtVerify } from "jose";

export async function getJwtSecretKey() {
  const secret = process.env.NEXT_PUBLIC_JWT_SECRET_KEY;

  if (!secret) {
    throw new Error("JWT Secret key is not found");
  }

  return new TextEncoder().encode(secret);
}

export async function verifyJwtToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());

    // console.log("payload:", payload)

    return payload;
  } catch (error) {
    return null;
  }
}

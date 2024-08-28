import { NextRequest, NextResponse } from 'next/server'
import { cryptoWaitReady, signatureVerify, decodeAddress } from '@polkadot/util-crypto'
import { u8aToHex } from '@polkadot/util'


export const dynamic = 'force-dynamic' // static by default, unless reading the request
export interface VerifyResult {
  passed: boolean
}

export async function  GET(request: NextRequest, _: NextResponse) {
  // const { publicAddress = '', nonce = '', signature = '' } = request.query

  const address = request.nextUrl.searchParams.get('publicAddress')
  const nonce = request.nextUrl.searchParams.get('nonce')
  const signature = request.nextUrl.searchParams.get('signature')

  const publicKey = decodeAddress(address)
  const hexPublicKey = u8aToHex(publicKey)
  try {
    await cryptoWaitReady()
    const { isValid } = signatureVerify(
      nonce as string,
      signature as string,
      address as string
    )
    return NextResponse.json({ passed: isValid })

  } catch {
    return NextResponse.json({ passed: false })
  }

}


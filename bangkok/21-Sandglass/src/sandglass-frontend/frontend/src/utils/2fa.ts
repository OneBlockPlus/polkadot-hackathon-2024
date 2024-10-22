/* global BigInt */
import { buildPoseidon } from 'circomlibjs'
import crypto from 'crypto-browserify'
import base32 from 'hi-base32'
import QRCode from 'qrcode'
import { TOTP } from 'totp-generator'

const urlPrefix = 'otpauth://totp/sandglassnet?secret='
const urlSuffix = '&issuer=sandglass'

async function generateQRcode(secret: any) {
  return await QRCode.toDataURL(urlPrefix.concat(secret).concat(urlSuffix))
}

function generateSecret(length = 20) {
  const randomBuffer = crypto.randomBytes(length)
  return base32.encode(randomBuffer).replace(/=/g, '')
}

export async function generateMerkleTree() {
  const SECRET = generateSecret()
  const uri = await generateQRcode(SECRET)

  const startTime = Math.floor(Date.now() / 30000 - 1) * 30000

  const poseidon = await buildPoseidon()
  const hashes: any = []
  const tokens: any = {}

  for (let i = 0; i < 2 ** 7; i++) {
    const time = startTime + i * 30000
    const token = TOTP.generate(SECRET, { timestamp: time })
    tokens[time] = token
    hashes.push(poseidon.F.toObject(poseidon([BigInt(time), BigInt(token.otp)])))
  }
  //console.log(tokens);
  //console.log(hashes);

  // compute root
  let k = 0

  for (let i = 2 ** 7; i < 2 ** 8 - 1; i++) {
    hashes.push(poseidon.F.toObject(poseidon([hashes[k * 2], hashes[k * 2 + 1]])))
    k++
  }
  const root = hashes[2 ** 8 - 2]
  console.log('Merkle root:', root)

  localStorage.setItem('OTPhashes', hashes)
  return [uri, SECRET, root]
}

export async function generateInput(otp: any) {
  const hashes = localStorage.getItem('OTPhashes')?.split(',')?.map(BigInt)

  const poseidon = await buildPoseidon()

  const currentTime = Math.floor(Date.now() / 30000) * 30000

  let currentNode = poseidon.F.toObject(poseidon([BigInt(currentTime), BigInt(otp)]))
  //console.log(currentNode);
  if (!hashes) {
    return
  }

  if (hashes.indexOf(currentNode) < 0) {
    throw new Error('Invalid OTP.')
  }

  const pathElements = []
  const pathIndex = []

  for (let i = 0; i < 7; i++) {
    if (hashes.indexOf(currentNode) % 2 === 0) {
      pathIndex.push(0)
      const currentIndex = hashes.indexOf(currentNode) + 1
      //console.log(currentIndex);
      pathElements.push(hashes[currentIndex])
      currentNode = poseidon.F.toObject(poseidon([hashes[currentIndex - 1], hashes[currentIndex]]))
    } else {
      pathIndex.push(1)
      const currentIndex = hashes.indexOf(currentNode) - 1
      //console.log(currentIndex);
      pathElements.push(hashes[currentIndex])
      currentNode = poseidon.F.toObject(poseidon([hashes[currentIndex], hashes[currentIndex + 1]]))
    }
  }

  return {
    time: currentTime,
    otp: otp,
    path_elements: pathElements,
    path_index: pathIndex,
  }
}

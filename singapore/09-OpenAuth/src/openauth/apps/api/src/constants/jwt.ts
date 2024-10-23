import * as crypto from 'node:crypto'

import dotenv from 'dotenv'

dotenv.config()

export const JWT_PRIVATE_KEY = `
-----BEGIN PRIVATE KEY-----
${process.env.JWT_PRIVATE_KEY}
-----END PRIVATE KEY-----
`.trim()

const pubKeyObject = crypto.createPublicKey({ key: JWT_PRIVATE_KEY, format: 'pem' })
const publicKey = pubKeyObject.export({ format: 'pem', type: 'spki' })
export const JWT_PUBLIC_KEY = publicKey.toString().trim()

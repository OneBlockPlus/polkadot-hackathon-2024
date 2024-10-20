import jwt from 'jsonwebtoken'
import { JwtPayload } from '@repo/schema'
import { JWT_SECRET } from './constants'

export function jwtSign(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET)
}

export function jwtVerify(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

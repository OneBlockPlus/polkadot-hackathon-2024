import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export let randomHex = (n: number) =>
  Array.from(crypto.getRandomValues(new Uint8Array(n)))
    .map(
      (x, i) => (
        (i = ((x / 255) * 61) | 0),
          String.fromCharCode(i + (i > 9 ? (i > 35 ? 61 : 55) : 48))
      ),
    )
    .join('')

async function digestMessage(message: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .trim()
}

export async function saltAndHashPassword(password: string) {
  const salt = process.env.AUTH_SALT
  return digestMessage(password + salt)
}

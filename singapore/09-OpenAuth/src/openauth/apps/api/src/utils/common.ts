export async function sleep(duration: number) {
  return new Promise((resolve) => { setTimeout(resolve, duration) })
}

export function generateReferCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let referCode = ''
  for (let i = 0; i < 8; i += 1) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    referCode += chars[randomIndex]
  }
  return referCode
}

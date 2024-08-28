export function getSolanaProvider() {
  if ('solana' in window) {
    const anyWindow: any = window
    return anyWindow.solana
  }
}

export function getEthereumProvider() {
  if ('ethereum' in window) {
    const anyWindow: any = window
    return anyWindow.ethereum
  }
}

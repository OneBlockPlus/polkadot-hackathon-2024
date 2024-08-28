import { erc20Abi } from 'abitype/abis'
import { createPublicClient, formatEther, formatUnits, http, publicActions } from 'viem'
import { bsc, mainnet, sepolia } from 'viem/chains'

import type { EthereumChain } from './types'

export async function getEthereumTokenBalance({
  chainName,
  tokenAddress,
  walletAddress,
  rpcUrl,
}: {
  chainName: `${EthereumChain}`
  tokenAddress?: `0x${string}`
  walletAddress: `0x${string}`
  rpcUrl: string
}) {
  const chain = { sepolia, mainnet, bsc }[chainName]

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  }).extend(publicActions)

  if (!tokenAddress) {
    const balance = await client.getBalance({ address: walletAddress })

    return {
      uiBalance: Number.parseFloat(formatEther(balance)),
      balance,
      decimals: 18,
    }
  }

  const decimals = await client.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'decimals',
  })

  const balance = await client.readContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [walletAddress],
  })

  return {
    uiBalance: Number.parseFloat(formatUnits(balance, decimals)),
    balance,
    decimals,
  }
}

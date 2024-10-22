import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BookadotTicket
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const bookadotTicketAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_nftName', internalType: 'string', type: 'string' },
      { name: '_nftSymbol', internalType: 'string', type: 'string' },
      { name: '_baseUri', internalType: 'string', type: 'string' },
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_transferable', internalType: 'address', type: 'address' },
      { name: '_operator', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'approved',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'operator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'approved', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldBaseUri',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'newBaseUri',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'ChangedBaseURI',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'tokenId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_id', internalType: 'uint256', type: 'uint256' }],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'getApproved',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_address', internalType: 'address', type: 'address' }],
    name: 'getTokenOf',
    outputs: [
      { name: '_tokens', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'operator', internalType: 'address', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_receiver', internalType: 'address', type: 'address' }],
    name: 'mint',
    outputs: [{ name: 'id', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'operator', internalType: 'address', type: 'address' },
      { name: 'approved', internalType: 'bool', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_baseUri', internalType: 'string', type: 'string' }],
    name: 'setBaseUri',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_transferable', internalType: 'address', type: 'address' },
      { name: '_persmission', internalType: 'bool', type: 'bool' },
    ],
    name: 'setTransferable',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'index', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_tokenId', internalType: 'uint256', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_operator', internalType: 'address', type: 'address' },
      { name: '_persmission', internalType: 'bool', type: 'bool' },
    ],
    name: 'updateOperator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotTicketAbi}__
 */
export const useReadBookadotTicket = /*#__PURE__*/ createUseReadContract({
  abi: bookadotTicketAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadBookadotTicketBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotTicketAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"getApproved"`
 */
export const useReadBookadotTicketGetApproved =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotTicketAbi,
    functionName: 'getApproved',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"getTokenOf"`
 */
export const useReadBookadotTicketGetTokenOf =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotTicketAbi,
    functionName: 'getTokenOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadBookadotTicketIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotTicketAbi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"name"`
 */
export const useReadBookadotTicketName = /*#__PURE__*/ createUseReadContract({
  abi: bookadotTicketAbi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"ownerOf"`
 */
export const useReadBookadotTicketOwnerOf = /*#__PURE__*/ createUseReadContract(
  { abi: bookadotTicketAbi, functionName: 'ownerOf' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadBookadotTicketSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotTicketAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadBookadotTicketSymbol = /*#__PURE__*/ createUseReadContract({
  abi: bookadotTicketAbi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"tokenByIndex"`
 */
export const useReadBookadotTicketTokenByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotTicketAbi,
    functionName: 'tokenByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"tokenOfOwnerByIndex"`
 */
export const useReadBookadotTicketTokenOfOwnerByIndex =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotTicketAbi,
    functionName: 'tokenOfOwnerByIndex',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"tokenURI"`
 */
export const useReadBookadotTicketTokenUri =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotTicketAbi,
    functionName: 'tokenURI',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadBookadotTicketTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotTicketAbi,
    functionName: 'totalSupply',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotTicketAbi}__
 */
export const useWriteBookadotTicket = /*#__PURE__*/ createUseWriteContract({
  abi: bookadotTicketAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteBookadotTicketApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotTicketAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"burn"`
 */
export const useWriteBookadotTicketBurn = /*#__PURE__*/ createUseWriteContract({
  abi: bookadotTicketAbi,
  functionName: 'burn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteBookadotTicketMint = /*#__PURE__*/ createUseWriteContract({
  abi: bookadotTicketAbi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteBookadotTicketSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotTicketAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteBookadotTicketSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotTicketAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"setBaseUri"`
 */
export const useWriteBookadotTicketSetBaseUri =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotTicketAbi,
    functionName: 'setBaseUri',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"setTransferable"`
 */
export const useWriteBookadotTicketSetTransferable =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotTicketAbi,
    functionName: 'setTransferable',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteBookadotTicketTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotTicketAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"updateOperator"`
 */
export const useWriteBookadotTicketUpdateOperator =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotTicketAbi,
    functionName: 'updateOperator',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotTicketAbi}__
 */
export const useSimulateBookadotTicket =
  /*#__PURE__*/ createUseSimulateContract({ abi: bookadotTicketAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateBookadotTicketApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotTicketAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulateBookadotTicketBurn =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotTicketAbi,
    functionName: 'burn',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateBookadotTicketMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotTicketAbi,
    functionName: 'mint',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateBookadotTicketSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotTicketAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateBookadotTicketSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotTicketAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"setBaseUri"`
 */
export const useSimulateBookadotTicketSetBaseUri =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotTicketAbi,
    functionName: 'setBaseUri',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"setTransferable"`
 */
export const useSimulateBookadotTicketSetTransferable =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotTicketAbi,
    functionName: 'setTransferable',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateBookadotTicketTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotTicketAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotTicketAbi}__ and `functionName` set to `"updateOperator"`
 */
export const useSimulateBookadotTicketUpdateOperator =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotTicketAbi,
    functionName: 'updateOperator',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bookadotTicketAbi}__
 */
export const useWatchBookadotTicketEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: bookadotTicketAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bookadotTicketAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchBookadotTicketApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bookadotTicketAbi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bookadotTicketAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchBookadotTicketApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bookadotTicketAbi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bookadotTicketAbi}__ and `eventName` set to `"ChangedBaseURI"`
 */
export const useWatchBookadotTicketChangedBaseUriEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bookadotTicketAbi,
    eventName: 'ChangedBaseURI',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bookadotTicketAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchBookadotTicketTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bookadotTicketAbi,
    eventName: 'Transfer',
  })

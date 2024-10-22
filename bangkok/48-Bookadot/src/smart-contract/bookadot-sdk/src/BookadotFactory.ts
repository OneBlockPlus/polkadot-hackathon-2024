import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BookadotFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const bookadotFactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_config', internalType: 'address', type: 'address' },
      { name: '_ticketFactory', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'property',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'bookedTimestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'bookingData',
        internalType: 'struct Booking',
        type: 'tuple',
        components: [
          { name: 'id', internalType: 'string', type: 'string' },
          {
            name: 'checkInTimestamp',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'checkOutTimestamp',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'balance', internalType: 'uint256', type: 'uint256' },
          { name: 'ticketId', internalType: 'uint256', type: 'uint256' },
          { name: 'guest', internalType: 'address', type: 'address' },
          { name: 'token', internalType: 'address', type: 'address' },
          { name: 'status', internalType: 'enum BookingStatus', type: 'uint8' },
          {
            name: 'cancellationPolicies',
            internalType: 'struct CancellationPolicy[]',
            type: 'tuple[]',
            components: [
              { name: 'expiryTime', internalType: 'uint256', type: 'uint256' },
              {
                name: 'refundAmount',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
        ],
        indexed: false,
      },
    ],
    name: 'Book',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'property',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'bookingId',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'guestAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'hostAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'treasuryAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'cancelTimestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CancelByGuest',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'property',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'bookingId',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'guestAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'cancelTimestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'CancelByHost',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'property',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'bookingId',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'hostAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'treasuryAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'payoutTimestamp',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'payoutType',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'Payout',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'ids',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
      {
        name: 'properties',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
      {
        name: 'host',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'PropertyCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'newAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'TicketFactoryChanged',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_bookingData',
        internalType: 'struct Booking',
        type: 'tuple',
        components: [
          { name: 'id', internalType: 'string', type: 'string' },
          {
            name: 'checkInTimestamp',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'checkOutTimestamp',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'balance', internalType: 'uint256', type: 'uint256' },
          { name: 'ticketId', internalType: 'uint256', type: 'uint256' },
          { name: 'guest', internalType: 'address', type: 'address' },
          { name: 'token', internalType: 'address', type: 'address' },
          { name: 'status', internalType: 'enum BookingStatus', type: 'uint8' },
          {
            name: 'cancellationPolicies',
            internalType: 'struct CancellationPolicy[]',
            type: 'tuple[]',
            components: [
              { name: 'expiryTime', internalType: 'uint256', type: 'uint256' },
              {
                name: 'refundAmount',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
        ],
      },
    ],
    name: 'book',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_bookingId', internalType: 'string', type: 'string' },
      { name: '_guestAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_hostAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_treasuryAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_cancelTimestamp', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'cancelByGuest',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_bookingId', internalType: 'string', type: 'string' },
      { name: '_guestAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_cancelTimestamp', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'cancelByHost',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'configContract',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_ids', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_host', internalType: 'address', type: 'address' },
      { name: '_ticketData', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'deployProperty',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_bookingId', internalType: 'string', type: 'string' },
      { name: '_hostAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_treasuryAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_payoutTimestamp', internalType: 'uint256', type: 'uint256' },
      { name: '_payoutType', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'payout',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newTicketFactory', internalType: 'address', type: 'address' },
    ],
    name: 'setTicketFactory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_params',
        internalType: 'struct BookingParameters',
        type: 'tuple',
        components: [
          { name: 'token', internalType: 'address', type: 'address' },
          { name: 'bookingId', internalType: 'string', type: 'string' },
          {
            name: 'checkInTimestamp',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'checkOutTimestamp',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'bookingExpirationTimestamp',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'bookingAmount', internalType: 'uint256', type: 'uint256' },
          {
            name: 'cancellationPolicies',
            internalType: 'struct CancellationPolicy[]',
            type: 'tuple[]',
            components: [
              { name: 'expiryTime', internalType: 'uint256', type: 'uint256' },
              {
                name: 'refundAmount',
                internalType: 'uint256',
                type: 'uint256',
              },
            ],
          },
        ],
      },
      { name: '_signature', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'verifyBookingData',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotFactoryAbi}__
 */
export const useReadBookadotFactory = /*#__PURE__*/ createUseReadContract({
  abi: bookadotFactoryAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"configContract"`
 */
export const useReadBookadotFactoryConfigContract =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotFactoryAbi,
    functionName: 'configContract',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"owner"`
 */
export const useReadBookadotFactoryOwner = /*#__PURE__*/ createUseReadContract({
  abi: bookadotFactoryAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"verifyBookingData"`
 */
export const useReadBookadotFactoryVerifyBookingData =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotFactoryAbi,
    functionName: 'verifyBookingData',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotFactoryAbi}__
 */
export const useWriteBookadotFactory = /*#__PURE__*/ createUseWriteContract({
  abi: bookadotFactoryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"book"`
 */
export const useWriteBookadotFactoryBook = /*#__PURE__*/ createUseWriteContract(
  { abi: bookadotFactoryAbi, functionName: 'book' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"cancelByGuest"`
 */
export const useWriteBookadotFactoryCancelByGuest =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotFactoryAbi,
    functionName: 'cancelByGuest',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"cancelByHost"`
 */
export const useWriteBookadotFactoryCancelByHost =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotFactoryAbi,
    functionName: 'cancelByHost',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"deployProperty"`
 */
export const useWriteBookadotFactoryDeployProperty =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotFactoryAbi,
    functionName: 'deployProperty',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"payout"`
 */
export const useWriteBookadotFactoryPayout =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotFactoryAbi,
    functionName: 'payout',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteBookadotFactoryRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"setTicketFactory"`
 */
export const useWriteBookadotFactorySetTicketFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotFactoryAbi,
    functionName: 'setTicketFactory',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteBookadotFactoryTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotFactoryAbi}__
 */
export const useSimulateBookadotFactory =
  /*#__PURE__*/ createUseSimulateContract({ abi: bookadotFactoryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"book"`
 */
export const useSimulateBookadotFactoryBook =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotFactoryAbi,
    functionName: 'book',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"cancelByGuest"`
 */
export const useSimulateBookadotFactoryCancelByGuest =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotFactoryAbi,
    functionName: 'cancelByGuest',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"cancelByHost"`
 */
export const useSimulateBookadotFactoryCancelByHost =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotFactoryAbi,
    functionName: 'cancelByHost',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"deployProperty"`
 */
export const useSimulateBookadotFactoryDeployProperty =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotFactoryAbi,
    functionName: 'deployProperty',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"payout"`
 */
export const useSimulateBookadotFactoryPayout =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotFactoryAbi,
    functionName: 'payout',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateBookadotFactoryRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotFactoryAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"setTicketFactory"`
 */
export const useSimulateBookadotFactorySetTicketFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotFactoryAbi,
    functionName: 'setTicketFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateBookadotFactoryTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bookadotFactoryAbi}__
 */
export const useWatchBookadotFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: bookadotFactoryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `eventName` set to `"Book"`
 */
export const useWatchBookadotFactoryBookEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bookadotFactoryAbi,
    eventName: 'Book',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `eventName` set to `"CancelByGuest"`
 */
export const useWatchBookadotFactoryCancelByGuestEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bookadotFactoryAbi,
    eventName: 'CancelByGuest',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `eventName` set to `"CancelByHost"`
 */
export const useWatchBookadotFactoryCancelByHostEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bookadotFactoryAbi,
    eventName: 'CancelByHost',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchBookadotFactoryOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bookadotFactoryAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `eventName` set to `"Payout"`
 */
export const useWatchBookadotFactoryPayoutEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bookadotFactoryAbi,
    eventName: 'Payout',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `eventName` set to `"PropertyCreated"`
 */
export const useWatchBookadotFactoryPropertyCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bookadotFactoryAbi,
    eventName: 'PropertyCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link bookadotFactoryAbi}__ and `eventName` set to `"TicketFactoryChanged"`
 */
export const useWatchBookadotFactoryTicketFactoryChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: bookadotFactoryAbi,
    eventName: 'TicketFactoryChanged',
  })

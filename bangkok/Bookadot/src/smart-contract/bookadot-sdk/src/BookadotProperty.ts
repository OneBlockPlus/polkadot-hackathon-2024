import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// BookadotProperty
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const bookadotPropertyAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_id', internalType: 'uint256', type: 'uint256' },
      { name: '_config', internalType: 'address', type: 'address' },
      { name: '_factory', internalType: 'address', type: 'address' },
      { name: '_host', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'InsufficientAllowance' },
  { type: 'error', inputs: [], name: 'TransferFailed' },
  {
    type: 'function',
    inputs: [{ name: 'delegate', internalType: 'address', type: 'address' }],
    name: 'approve',
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
    name: 'book',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'string', type: 'string' }],
    name: 'bookings',
    outputs: [
      { name: 'id', internalType: 'string', type: 'string' },
      { name: 'checkInTimestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'checkOutTimestamp', internalType: 'uint256', type: 'uint256' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'ticketId', internalType: 'uint256', type: 'uint256' },
      { name: 'guest', internalType: 'address', type: 'address' },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'status', internalType: 'enum BookingStatus', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_params',
        internalType: 'struct BookingParameters[]',
        type: 'tuple[]',
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
      { name: '_signature', internalType: 'bytes[]', type: 'bytes[]' },
    ],
    name: 'bulkBook',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '_bookingId', internalType: 'string', type: 'string' }],
    name: 'cancel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_bookingId', internalType: 'string', type: 'string' }],
    name: 'cancelByHost',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_bookingId', internalType: 'string', type: 'string' }],
    name: 'getBooking',
    outputs: [
      {
        name: '',
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
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'hostDelegates',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'id',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_bookingId', internalType: 'string', type: 'string' }],
    name: 'payout',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'delegate', internalType: 'address', type: 'address' }],
    name: 'revoke',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_ticket', internalType: 'address', type: 'address' }],
    name: 'setTicketAddress',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalBooking',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotPropertyAbi}__
 */
export const useReadBookadotProperty = /*#__PURE__*/ createUseReadContract({
  abi: bookadotPropertyAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"bookings"`
 */
export const useReadBookadotPropertyBookings =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotPropertyAbi,
    functionName: 'bookings',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"getBooking"`
 */
export const useReadBookadotPropertyGetBooking =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotPropertyAbi,
    functionName: 'getBooking',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"hostDelegates"`
 */
export const useReadBookadotPropertyHostDelegates =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotPropertyAbi,
    functionName: 'hostDelegates',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"id"`
 */
export const useReadBookadotPropertyId = /*#__PURE__*/ createUseReadContract({
  abi: bookadotPropertyAbi,
  functionName: 'id',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"totalBooking"`
 */
export const useReadBookadotPropertyTotalBooking =
  /*#__PURE__*/ createUseReadContract({
    abi: bookadotPropertyAbi,
    functionName: 'totalBooking',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotPropertyAbi}__
 */
export const useWriteBookadotProperty = /*#__PURE__*/ createUseWriteContract({
  abi: bookadotPropertyAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteBookadotPropertyApprove =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotPropertyAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"book"`
 */
export const useWriteBookadotPropertyBook =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotPropertyAbi,
    functionName: 'book',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"bulkBook"`
 */
export const useWriteBookadotPropertyBulkBook =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotPropertyAbi,
    functionName: 'bulkBook',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"cancel"`
 */
export const useWriteBookadotPropertyCancel =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotPropertyAbi,
    functionName: 'cancel',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"cancelByHost"`
 */
export const useWriteBookadotPropertyCancelByHost =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotPropertyAbi,
    functionName: 'cancelByHost',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"payout"`
 */
export const useWriteBookadotPropertyPayout =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotPropertyAbi,
    functionName: 'payout',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"revoke"`
 */
export const useWriteBookadotPropertyRevoke =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotPropertyAbi,
    functionName: 'revoke',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"setTicketAddress"`
 */
export const useWriteBookadotPropertySetTicketAddress =
  /*#__PURE__*/ createUseWriteContract({
    abi: bookadotPropertyAbi,
    functionName: 'setTicketAddress',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotPropertyAbi}__
 */
export const useSimulateBookadotProperty =
  /*#__PURE__*/ createUseSimulateContract({ abi: bookadotPropertyAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateBookadotPropertyApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotPropertyAbi,
    functionName: 'approve',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"book"`
 */
export const useSimulateBookadotPropertyBook =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotPropertyAbi,
    functionName: 'book',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"bulkBook"`
 */
export const useSimulateBookadotPropertyBulkBook =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotPropertyAbi,
    functionName: 'bulkBook',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"cancel"`
 */
export const useSimulateBookadotPropertyCancel =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotPropertyAbi,
    functionName: 'cancel',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"cancelByHost"`
 */
export const useSimulateBookadotPropertyCancelByHost =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotPropertyAbi,
    functionName: 'cancelByHost',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"payout"`
 */
export const useSimulateBookadotPropertyPayout =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotPropertyAbi,
    functionName: 'payout',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"revoke"`
 */
export const useSimulateBookadotPropertyRevoke =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotPropertyAbi,
    functionName: 'revoke',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link bookadotPropertyAbi}__ and `functionName` set to `"setTicketAddress"`
 */
export const useSimulateBookadotPropertySetTicketAddress =
  /*#__PURE__*/ createUseSimulateContract({
    abi: bookadotPropertyAbi,
    functionName: 'setTicketAddress',
  })


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

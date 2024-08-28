import { HexString } from '@polkadot/util/types'

export interface ChopsticksInput {
    fromEndpoint: string
    fromBlockNumber: number
    extrinsic: HexString
}

export interface XcmChopsticksInput extends ChopsticksInput {
    toEndpoint: string
    fromId: number
    toId: number
    relay: string
}

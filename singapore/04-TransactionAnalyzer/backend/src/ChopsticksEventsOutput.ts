import { HexString } from '@polkadot/util/types'

export interface ChopsticksEventsOutput {
  events: HexString
  extrinsicIndex: number
}

export interface XcmChopsticksEventsOutput {
  fromEvents: ChopsticksEventsOutput
  toEvents: ChopsticksEventsOutput
}
'use client'

import Identicon from '@polkadot/react-identicon'


export default function PokaDotAvatar({ address, size=24 }: { address: string, size?: number }) {
  return (<Identicon value={address}
                     size={size}
                     theme={'polkadot'}
  className={'aspect-square h-full w-full'}/>)
}
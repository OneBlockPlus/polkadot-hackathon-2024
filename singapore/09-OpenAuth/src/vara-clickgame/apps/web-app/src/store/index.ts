import { SonicClient } from '@sonic-wallet/sdk-core'
import { atom, useAtom } from 'jotai'

export const clickCountAtom = atom(0)

const sonicClientAtom = atom(new SonicClient('/'))

export function useSonicClient() {
  const [sonicClient, setSonicClient] = useAtom(sonicClientAtom)
  return { sonicClient, setSonicClient }
}

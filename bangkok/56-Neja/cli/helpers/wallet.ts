import { Keyring } from '@polkadot/api'
import { mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto'

const keyring = new Keyring({ type: 'sr25519' });
keyring.setSS58Format(7);

export const generateWallet = async (secret?: string): Promise<{secret: string, address: string}> => {
  await cryptoWaitReady()
  const mnemonic = mnemonicGenerate();

  const secretSeed = secret || `0x${stringToBlakeTwo256Hash(mnemonic)}`

  const pair = keyring.addFromUri(secretSeed)

  return {
    secret: secretSeed,
    address: pair.address
  }
}

function stringToBlakeTwo256Hash(mnemonic: string) {
  return '//Alice';
}

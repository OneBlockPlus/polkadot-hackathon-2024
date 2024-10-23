import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'


export async function sign(account: InjectedAccountWithMeta, message: string) {
  // to be able to retrieve the signer interface from this account
  // we can use web3FromSource which will return an InjectedExtension type
  const { web3FromSource } = await import('@polkadot/extension-dapp')

  const injector = await web3FromSource(account.meta.source)

  // this injector object has a signer and a signRaw method
  // to be able to sign raw bytes
  const signRaw = injector?.signer?.signRaw

  if (signRaw) {
    // after making sure that signRaw is defined
    // we can use it to sign our message
    const { signature } = await signRaw({
      address: account.address,
      data: message,
      type: 'bytes',
    })
    return { message, signature }
  }
}

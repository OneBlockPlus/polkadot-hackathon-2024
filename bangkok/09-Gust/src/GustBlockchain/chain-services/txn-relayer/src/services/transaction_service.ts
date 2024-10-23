import { Keyring } from '@polkadot/api';

export const sendTransaction = async (client: any, recipientAddress: string, amount: string) => {
  const relayerSeed = process.env.RELAYER_SEED || "//relayer"; 
  const keyring = new Keyring({ type: 'sr25519' });
  const relayer = keyring.addFromUri(relayerSeed);

  const transfer = client.tx.balances.transfer(recipientAddress, amount);

  const hash = await transfer.signAndSend(relayer, { nonce: -1 }); 
  return hash;
};
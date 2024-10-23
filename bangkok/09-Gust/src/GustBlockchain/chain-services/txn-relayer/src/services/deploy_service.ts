import { Keyring } from '@polkadot/api';

export const deploySmartContract = async (client: any, codeHash: string, args: any[]) => {
    const relayerSeed = process.env.RELAYER_SEED || "//relayer"; 
    const keyring = new Keyring({ type: 'sr25519' });
    const relayer = keyring.addFromUri(relayerSeed);
  
    const deploy = client.tx.contracts.instantiate(
      0,
      0,
      codeHash,
      args 
    );
  
    const hash = await deploy.signAndSend(relayer, { nonce: -1 });
    return hash;
  };
  
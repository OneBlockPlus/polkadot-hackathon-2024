// deploy code on-chain. 
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import path from 'path';

const keyring = new Keyring()
const keypair = keyring.addFromUri('//Alice')

export const deployCloudFunctionOnChain = async (projectPath: string): Promise<void> => {
  const wsProvider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider: wsProvider });

  if(!projectPath) throw Error("Unable to read the cloud function at the path.");

  const wasmPath = path.join(process.cwd(), projectPath, 'build', 'release.wasm');
  

  const response =  await api.tx.templateModule.save_cloud_function().signAndSend(keypair)

  if(response) {
    console.log('Cloud function deployment successful!')
  }
};

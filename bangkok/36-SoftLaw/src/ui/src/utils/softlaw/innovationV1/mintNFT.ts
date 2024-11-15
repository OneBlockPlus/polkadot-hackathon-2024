import { ApiPromise } from '@polkadot/api';
import { web3FromSource } from "@polkadot/extension-dapp";
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type { EventRecord, ExtrinsicStatus } from '@polkadot/types/interfaces';
import { getSoftlawApi } from '../getApi';

interface NFTMintResult {
  nftId: string;
  blockHash: string;
}

interface MintNFTParams {
  name: string;
  description: string;
  filingDate: string;
  jurisdiction: string;
}

const mintNFT = async (
  selectedAccount: InjectedAccountWithMeta,
  params: MintNFTParams
): Promise<NFTMintResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      const api = await getSoftlawApi();
      if (!api || !selectedAccount) {
        throw new Error("No account or API available");
      }

      // Obtener el injector
      const injector = await web3FromSource(selectedAccount.meta.source);

      // Crear la transacción
      const tx = api.tx.ipPallet.mintNft(
        params.name,
        params.description,
        params.filingDate,
        params.jurisdiction
      );

      // Firmar y enviar
      await tx.signAndSend(
        selectedAccount.address,
        { signer: injector.signer as any }, // Usamos any temporalmente para evitar el error de tipos
        ({ status, events, dispatchError }: any) => {
          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(dispatchError.asModule);
              const { docs, name, section } = decoded;
              reject(new Error(`${section}.${name}: ${docs.join(" ")}`));
            } else {
              reject(new Error(dispatchError.toString()));
            }
            return;
          }

          if (status.isInBlock) {
            const blockHash = status.asInBlock.toString();
            
            // Buscar el evento NftMinted
            events.forEach(({ event }: any) => {
              if (event.section === 'ipPallet' && event.method === 'NftMinted') {
                const nftId = event.data[0].toString();
                resolve({
                  nftId,
                  blockHash
                });
              }
            });
          }
        }
      );
    } catch (error) {
      reject(error instanceof Error ? error : new Error("Unknown error during minting"));
    }
  });
};

export default mintNFT;
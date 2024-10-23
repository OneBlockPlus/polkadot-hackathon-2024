import { DedotClient, WsProvider } from 'dedot';
import { ContractDeployer } from 'dedot/contracts';
import { FlipperContractApi } from '../../DedotScript/flipper';
import { stringToHex } from 'dedot/utils';
import { Keyring } from '@polkadot/keyring';
import { randomBytes } from 'crypto';
import path from 'path';
import { promises as fsPromises } from 'fs';

const POP_NETWORK_ENDPOINT = 'wss://rpc1.paseo.popnetwork.xyz';

function generateRandomSalt(length: number): string {
    return randomBytes(length).toString('hex');
}

export async function initializeContract(): Promise<{ client: DedotClient, deployer: ContractDeployer<FlipperContractApi> }> {
    const provider = new WsProvider(POP_NETWORK_ENDPOINT);
    const client = await DedotClient.new(provider);

    const contractPath = await findFileInProject('flipper.contract');
    if (!contractPath) {
        throw new Error('flipper.contract not found');
    }

    const contractData: string = await fsPromises.readFile(contractPath, 'utf-8');
    const jsonData = JSON.parse(contractData);
    const wasm = jsonData.source?.wasm;
    if (!wasm) {
        throw new Error('Failed to retrieve wasm data from flipper.contract');
    }

    const deployer = new ContractDeployer<FlipperContractApi>(client, jsonData, wasm);
    return { client, deployer };
}

async function findFileInProject(fileName: string, startDir: string = process.cwd()): Promise<string | null> {
    const stack = [startDir];

    while (stack.length > 0) {
        const currentDir = stack.pop()!;
        const files = await fsPromises.readdir(currentDir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(currentDir, file.name);
            if (file.isDirectory()) {
                stack.push(fullPath);
            } else if (file.isFile() && file.name === fileName) {
                return fullPath;
            }
        }
    }

    return null;
}
export async function deployContract(deployer: ContractDeployer<FlipperContractApi>): Promise<string | undefined> {
    const keyring = new Keyring({ type: 'sr25519'});
    const alice = keyring.addFromUri('//Alice');
    console.log(alice.address);

    const salt = stringToHex(generateRandomSalt(16));

    const dryRun = await deployer.query.new(true, { caller: alice.address, salt });
    const { raw: { gasRequired, storageDeposit } } = dryRun;

    return new Promise<string | undefined>((resolve, reject) => {
        deployer.tx.new(true, { gasLimit: gasRequired, salt })
            .signAndSend(alice, ({ status, events }) => {
                if (status.type === 'BestChainBlockIncluded' || status.type === 'Finalized') {
                    try {
                        const instantiatedEvent = deployer.client.events.contracts.Instantiated.find(events);
                        const address = instantiatedEvent?.palletEvent.data.contract.address();

                        if (address) {
                            resolve(address);
                        } else {
                            reject(new Error('Contract address not found in events.'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                }
            });
    });
}
export async function disconnectClient(client: DedotClient): Promise<void> {
    await client.disconnect();
}
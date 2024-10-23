import { SubstrateDeployment } from "@scio-labs/use-inkathon";

import { env } from "@/config/environment";

export enum ContractIds {
  Oracle = "oracle",
  Vault = "vault",
  Manager = "manager",
  PaymentManager = "paymentManager",
  ERC20 = "erc20",
  Distributor = "distributor",
}

export const getDeployments = async (): Promise<SubstrateDeployment[]> => {
  const networks = env.supportedChains;
  const deployments: SubstrateDeployment[] = [];

  for (const networkId of networks) {
    for (const contractId of Object.values(ContractIds)) {
      const abi = await import(`./${contractId}/${contractId}.json`);

      const { address } = await import(`./${contractId}/${contractId}.ts`);
      deployments.push({ contractId, networkId, abi, address });
    }
  }

  return deployments;
};

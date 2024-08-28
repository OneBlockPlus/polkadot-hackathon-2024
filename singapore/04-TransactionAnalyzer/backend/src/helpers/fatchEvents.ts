import { Blockchain, ChopsticksProvider } from "@acala-network/chopsticks-core";
import { ApiPromise } from "@polkadot/api";

export async function createApi(chain: Blockchain): Promise<ApiPromise> {
    const Provider = new ChopsticksProvider(chain)
    const api = new ApiPromise({ provider: Provider, noInitWarn: true })
    await api.isReadyOrError

    return api
}
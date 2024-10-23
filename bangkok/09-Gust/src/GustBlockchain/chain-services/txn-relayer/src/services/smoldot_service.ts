import { createClient } from "polkadot-api";
import { getSmProvider } from "polkadot-api/sm-provider";
import { start } from "polkadot-api/smoldot";

export const createSmoldotClient = async (chainSpec:string) => {
    try {
        const smoldot = start();
        const chain = await smoldot.addChain({ chainSpec });
        
        const client = createClient(
            getSmProvider(chain)
        );
        return client;
    } catch (error) {
        console.error(error)
    }

};

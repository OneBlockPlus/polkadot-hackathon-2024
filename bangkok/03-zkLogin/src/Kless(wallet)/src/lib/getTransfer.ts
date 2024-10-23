import { ApiPromise } from "@polkadot/api";

export const getTransfer = async (api: ApiPromise, blockNumber: number) => {
  const genesisHash = api.genesisHash.toHex();
  const blockHash = await api.rpc.chain.getBlockHash(blockNumber);

  if (
    blockHash.toHex() ===
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  )
    return [];

  try {
    const apiAt = await api.at(blockHash);
    const events = await apiAt.query.system.events();

    const result: any[] = [];

    events.forEach(async ({ event }) => {
      if (event.section === "balances" && event.method === "Transfer") {
        const [from, to, value] = event.data;
        const id = `${genesisHash}-${blockNumber}-event.index.toHex()`;
        result.push({
          id: id,
          genesisHash,
          blockNumber,
          blockHash: blockHash.toHex(),
          from: from.toString(),
          to: to.toString(),
          value: (value as any).toString(),
        });
      }
    });

    return result;
  } catch (error) {
    console.error("getTransfer error at", blockNumber);
    return [];
  }
};

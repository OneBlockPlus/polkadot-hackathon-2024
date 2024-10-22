import { cookieStorage, createConfig, createStorage, http } from '@wagmi/core';
import { moonbaseAlpha, moonbeam } from 'viem/chains';

export default createConfig({
    chains: [moonbeam, moonbaseAlpha],
    storage: createStorage({
        storage: cookieStorage,
    }),
    ssr: true,
    transports: {
        [moonbeam.id]: http(),
        [moonbaseAlpha.id]: http(),
    },
});

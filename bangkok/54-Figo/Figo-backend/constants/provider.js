import { providers } from 'ethers';

import dotenv from 'dotenv';
dotenv.config();

export const provider = new providers.JsonRpcProvider(`https://moonbase-alpha.public.blastapi.io`);

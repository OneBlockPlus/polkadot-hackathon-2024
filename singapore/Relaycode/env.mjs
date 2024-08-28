import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_DEFAULT_CHAIN: z.string().min(1),
    NEXT_PUBLIC_SUPPORTED_CHAINS: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DEFAULT_CHAIN: process.env.NEXT_PUBLIC_DEFAULT_CHAIN,
    NEXT_PUBLIC_SUPPORTED_CHAINS: process.env.NEXT_PUBLIC_SUPPORTED_CHAINS,
  },
});

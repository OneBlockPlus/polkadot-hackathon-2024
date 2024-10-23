import type { unstable_getBlockExtrinsics } from "@reactive-dot/core";

export type Extrinsic = NonNullable<
  Awaited<ReturnType<typeof unstable_getBlockExtrinsics>>
>[number];

export type BlockInfo = {
  hash: string;
  number: number;
  parent: string;
  extrinsics?: Extrinsic[] | undefined;
};

import type {
  Codec,
  metadata as metadataCodec,
} from "@polkadot-api/substrate-bindings";
import type { ChainId } from "@reactive-dot/core";

type _Metadata =
  typeof metadataCodec extends Codec<infer Metadata>
    ? // @ts-expect-error TODO: fix this
      Metadata["metadata"]
    : never;

export type Metadata = Extract<_Metadata, { tag: "v14" | "v15" }>["value"];

export type Pallet = Metadata["pallets"][number];

export type Constant = Pallet["constants"][number];

export type Storage = NonNullable<Pallet["storage"]>["items"][number];

export type RuntimeApi = Metadata["apis"][number];

export type RuntimeApiMethod = RuntimeApi["methods"][number];

type BaseQuery<T> = {
  id: `${string}-${string}-${string}-${string}-${string}`;
  chainId: ChainId;
  type: T;
};

export type ConstantQuery = BaseQuery<"constant"> & {
  pallet: string;
  constant: string;
};

export type StorageQuery = BaseQuery<"storage"> & {
  pallet: string;
  storage: string;
  key: unknown[];
};

export type StorageEntriesQuery = BaseQuery<"storage-entries"> & {
  pallet: string;
  storage: string;
  key: unknown[];
};

export type RuntimeApiQuery = BaseQuery<"api"> & {
  api: string;
  method: string;
  args: unknown[];
};

export type Query =
  | ConstantQuery
  | StorageQuery
  | StorageEntriesQuery
  | RuntimeApiQuery;

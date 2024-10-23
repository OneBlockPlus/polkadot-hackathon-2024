import type { BlockInfo, Extrinsic } from "../types";
import { atom } from "jotai";

// TODO: clean up this mess

export const blockMapAtom = atom(
  new Map<number, { hash: string; number: number; parent: string }>(),
);

export const blockExtrinsicsMapAtom = atom(new Map<string, Extrinsic[]>());

const _blocksAtom = atom<BlockInfo[]>((get) =>
  Array.from(get(blockMapAtom).values())
    .toSorted((a, b) => b.number - a.number)
    .map((block) => ({
      ...block,
      extrinsics: get(blockExtrinsicsMapAtom).get(block.hash),
    })),
);

export const blocksAtom = atom((get) => get(_blocksAtom).slice(0, 25));

const blockInViewNumberAtom = atom<number>();

export const blockInViewAtom = atom(
  (get) => {
    const blockNumber = get(blockInViewNumberAtom);

    if (blockNumber === undefined) {
      return;
    }

    return get(_blocksAtom).find((block) => block.number === blockNumber);
  },
  (_, set, blockNumber: number | undefined) =>
    set(blockInViewNumberAtom, blockNumber),
);

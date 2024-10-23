import type { ChainId } from "@reactive-dot/core";
import { useChainId } from "@reactive-dot/react";

export function useBabeChainId() {
  const chainId = useChainId();

  return chainId === "kusama" ||
    chainId === "polkadot" ||
    chainId === "paseo" ||
    chainId === "westend"
    ? chainId
    : undefined;
}

export function useAuraChainId() {
  const chainId = useChainId();

  return chainId !== "kusama" &&
    chainId !== "polkadot" &&
    chainId !== "paseo" &&
    chainId !== "westend"
    ? chainId
    : undefined;
}

export function usePeopleChainId() {
  const chainId = useChainId();
  switch (chainId) {
    case "polkadot":
    case "polkadot_asset_hub":
    case "polkadot_collectives":
    case "polkadot_people":
    case "hydration":
      return "polkadot_people" satisfies ChainId;
    case "kusama":
    case "kusama_asset_hub":
    case "kusama_people":
    case "tinkernet":
      return "kusama_people" satisfies ChainId;
    case "westend":
    case "westend_asset_hub":
    case "westend_collectives":
    case "westend_people":
      return "westend_people" satisfies ChainId;
    case "paseo":
      return "paseo" satisfies ChainId;
  }
}

export function useStakingChainId() {
  const chainId = useChainId();
  switch (chainId) {
    case "polkadot":
    case "polkadot_asset_hub":
    case "polkadot_collectives":
    case "polkadot_people":
    case "hydration":
      return "polkadot" satisfies ChainId;
    case "kusama":
    case "kusama_asset_hub":
    case "kusama_people":
    case "tinkernet":
      return "kusama" satisfies ChainId;
    case "paseo":
      return "paseo" satisfies ChainId;
    case "westend":
    case "westend_asset_hub":
    case "westend_collectives":
    case "westend_people":
      return "westend" satisfies ChainId;
  }
}

import { useLookup } from "./lookup";
import { getDynamicBuilder } from "@polkadot-api/metadata-builders";
import { useMemo } from "react";

export function useDynamicBuilder() {
  const lookup = useLookup();
  return useMemo(() => getDynamicBuilder(lookup), [lookup]);
}

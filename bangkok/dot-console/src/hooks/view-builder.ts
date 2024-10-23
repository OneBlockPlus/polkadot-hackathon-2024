import { useLookup } from "./lookup";
import { getViewBuilder } from "@polkadot-api/view-builder";
import { useMemo } from "react";

export function useViewBuilder() {
  const lookup = useLookup();
  return useMemo(() => getViewBuilder(lookup), [lookup]);
}

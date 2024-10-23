import { useMetadata } from "./metadata";
import { getLookupFn } from "@polkadot-api/metadata-builders";
import { useMemo } from "react";

export function useLookup() {
  const metadata = useMetadata();
  return useMemo(() => getLookupFn(metadata.value), [metadata.value]);
}

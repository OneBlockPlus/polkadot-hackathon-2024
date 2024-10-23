import { metadata as metadataCodec } from "@polkadot-api/substrate-bindings";
import { useLazyLoadQuery } from "@reactive-dot/react";

export function useMetadata() {
  const [v14, v15] = useLazyLoadQuery((builder) =>
    builder
      .callApi("Metadata", "metadata_at_version", [14])
      .callApi("Metadata", "metadata_at_version", [15]),
  );

  const latestMetadata = v15 ?? v14;

  if (latestMetadata === undefined) {
    throw new Error("Unsupported metadata version");
  }

  const { metadata } = metadataCodec.dec(latestMetadata.asBytes());

  if (metadata.tag !== "v14" && metadata.tag !== "v15") {
    throw new Error("Unsupported metadata version");
  }

  return metadata;
}

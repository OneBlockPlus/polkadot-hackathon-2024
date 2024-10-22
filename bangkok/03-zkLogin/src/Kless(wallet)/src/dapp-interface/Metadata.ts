import type {
  InjectedMetadata,
  InjectedMetadataKnown,
  MetadataDef,
} from "@polkadot/extension-inject/types";

export default class Metadata implements InjectedMetadata {
  public get(): Promise<InjectedMetadataKnown[]> {
    return [] as any;
  }

  public provide(definition: MetadataDef): Promise<boolean> {
    return false as any;
  }
}

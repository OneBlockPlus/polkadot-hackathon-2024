import { AccountListItem } from "../../../components/account-list-item";
import { useAuraChainId, useBabeChainId } from "../../../hooks/chain";
import { ScaleEnum, Struct, u32, u64 } from "@polkadot-api/substrate-bindings";
import { idle } from "@reactive-dot/core";
import { useLazyLoadQuery } from "@reactive-dot/react";
import { Suspense, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Spinner } from "~/components/ui/spinner";

const babeDigestCodec = ScaleEnum({
  authority_index: u32,
  one: u32,
  two: u32,
  three: u32,
});

const auraDigestCodec = Struct({ slotNumber: u64 });

export type BlockAuthorProps = {
  blockHash: string;
};

export function BlockAuthor(props: BlockAuthorProps) {
  return (
    <ErrorBoundary fallback={<>Error fetching block's author</>}>
      <Suspense fallback={<Spinner />}>
        <SuspendableBlockAuthor {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

export function SuspendableBlockAuthor({ blockHash }: BlockAuthorProps) {
  const digest = useLazyLoadQuery((builder) =>
    builder.readStorage("System", "Digest", [], {
      at: blockHash as `0x${string}`,
    }),
  );

  const digestValue = digest.at(0)?.value;

  const digestData =
    digestValue === undefined
      ? undefined
      : Array.isArray(digestValue)
        ? digestValue[1]
        : digestValue;

  const babeChainId = useBabeChainId();

  const authorIdOrSlotNumber = useMemo(() => {
    if (digestData === undefined) {
      return undefined;
    }

    if (babeChainId !== undefined) {
      return babeDigestCodec.dec(digestData.asBytes()).value;
    }

    return Number(auraDigestCodec.dec(digestData.asBytes()).slotNumber);
  }, [babeChainId, digestData]);

  const validators = useLazyLoadQuery(
    (builder) =>
      authorIdOrSlotNumber === undefined || babeChainId === undefined
        ? undefined
        : builder.readStorage("Session", "Validators", [], {
            at: blockHash as `0x${string}`,
          }),
    { chainId: babeChainId! },
  );

  const auraChainId = useAuraChainId();

  const collators = useLazyLoadQuery(
    (builder) =>
      authorIdOrSlotNumber === undefined || auraChainId === undefined
        ? undefined
        : builder.readStorage("CollatorSelection", "Invulnerables", [], {
            at: blockHash as `0x${string}`,
          }),
    { chainId: auraChainId! },
  );

  const authors = useMemo(() => {
    if (validators !== idle) {
      return validators;
    }

    if (collators !== idle) {
      return collators;
    }

    return undefined;
  }, [collators, validators]);

  const authorIndex = useMemo(() => {
    if (authorIdOrSlotNumber === undefined || authors === undefined) {
      return undefined;
    }

    if (auraChainId !== undefined) {
      return authorIdOrSlotNumber % authors.length;
    }

    return authorIdOrSlotNumber;
  }, [auraChainId, authorIdOrSlotNumber, authors]);

  const author =
    authorIndex === undefined ? undefined : authors?.at(authorIndex);

  if (author === undefined) {
    return null;
  }

  return <AccountListItem address={author} name={undefined} />;
}

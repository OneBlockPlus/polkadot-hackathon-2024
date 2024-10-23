import type {
  Pallet,
  Storage,
  StorageEntriesQuery,
  StorageQuery,
} from "../types";
import { PalletSelect } from "./pallet-select";
import {
  CodecParam,
  INCOMPLETE,
  INVALID,
  VOID,
  type ParamInput,
} from "./param";
import { Select } from "./select";
import { Button, Code, FormLabel, Text } from "./ui";
import { useChainId } from "@reactive-dot/react";
import { useMemo, useState, type ReactNode } from "react";
import { css } from "styled-system/css";
import { useViewBuilder } from "~/hooks/view-builder";

type StorageFormProps = {
  pallet: Pallet;
  palletSelect: ReactNode;
  onAddQuery: (query: StorageQuery | StorageEntriesQuery) => void;
};

export function StorageForm(
  props: Omit<StorageFormProps, "pallet" | "palletSelect">,
) {
  return (
    <PalletSelect
      filter={(pallet) =>
        pallet.storage !== undefined && pallet.storage.items.length > 0
      }
    >
      {({ pallet, palletSelect }) => (
        <StorageSelect
          key={pallet.index}
          pallet={pallet}
          palletSelect={palletSelect}
          {...props}
        />
      )}
    </PalletSelect>
  );
}

function StorageSelect({ pallet, palletSelect, onAddQuery }: StorageFormProps) {
  const storages = pallet.storage!.items;

  const [selectedStorage, setSelectedStorage] = useState(storages.at(0)!.name);

  const storage = storages.find((storage) => storage.name === selectedStorage);

  const storageItems = storages
    .map((storage) => ({
      label: storage.name,
      value: storage.name,
    }))
    .toSorted((a, b) => a.label.localeCompare(b.label));

  return (
    <div
      className={css({
        display: "grid",
        gridTemplateAreas: `
        "pallet storage"
        "key    key"
        "submit submit"
        "docs   docs"
      `,
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        gap: "1rem",
      })}
    >
      {palletSelect}
      <Select
        label="Storage"
        options={storageItems}
        value={selectedStorage}
        onChangeValue={setSelectedStorage}
      />
      {storage && (
        <>
          <Code
            className={css({
              gridArea: "docs",
              display: "block",
              whiteSpace: "pre-wrap",
              padding: "1rem",
            })}
          >
            {storage.docs.join("\n")}
          </Code>
          <StorageKey
            pallet={pallet}
            storage={storage}
            onAddQuery={onAddQuery}
          />
        </>
      )}
    </div>
  );
}

type StorageKeyProps = {
  pallet: Pallet;
  storage: Storage;
  onAddQuery: (query: StorageQuery | StorageEntriesQuery) => void;
};

function StorageKey(props: StorageKeyProps) {
  return (
    <_StorageKey key={props.pallet.index + props.storage.name} {...props} />
  );
}

function _StorageKey({ pallet, storage, onAddQuery }: StorageKeyProps) {
  const chainId = useChainId();
  const viewBuilder = useViewBuilder();

  const keyShapeDecoder =
    storage.type.tag === "plain"
      ? undefined
      : viewBuilder.buildDefinition(storage.type.value.key);

  const [key, setKey] = useState<ParamInput<unknown>>(INCOMPLETE);

  const maxKeyLength = useMemo(() => {
    switch (keyShapeDecoder?.shape.codec) {
      case undefined:
        return undefined;
      case "Tuple":
        return keyShapeDecoder.shape.shape.length;
      case "Array":
        return keyShapeDecoder.shape.len;
      default:
        return 1;
    }
  }, [keyShapeDecoder]);

  const [keyLength, setKeyLength] = useState(maxKeyLength ?? 0);

  const derivedKey = useMemo(() => {
    if (keyShapeDecoder === undefined) {
      return [];
    }

    if (key === VOID) {
      return [];
    }

    if (Array.isArray(key)) {
      return key;
    }

    return [key];
  }, [key, keyShapeDecoder]);

  const lengthLimitedKey = derivedKey.slice(0, keyLength);

  const isEntriesQuery =
    maxKeyLength !== undefined && lengthLimitedKey.length < maxKeyLength;

  const lengthLimitedKeyShapeDecoder = useMemo(() => {
    switch (keyShapeDecoder?.shape.codec) {
      case "Tuple":
        return {
          ...keyShapeDecoder,
          shape: {
            ...keyShapeDecoder.shape,
            shape: keyShapeDecoder.shape.shape.slice(0, keyLength),
          },
        };
      case "Array":
        return {
          ...keyShapeDecoder,
          shape: { ...keyShapeDecoder.shape, len: keyLength },
        };
      default:
        return keyShapeDecoder;
    }
  }, [keyLength, keyShapeDecoder]);

  return (
    <>
      {lengthLimitedKeyShapeDecoder && (
        <section
          className={css({
            gridArea: "key",
            "&:has(> div:empty)": {
              display: "none",
            },
          })}
        >
          <div>
            <FormLabel>Storage key</FormLabel>
            {maxKeyLength !== undefined && (
              <Text as="div" size="sm">
                {isEntriesQuery ? "All entries" : "One entry"} matching{" "}
                <select
                  value={keyLength}
                  onChange={(event) =>
                    setKeyLength(parseInt(event.target.value))
                  }
                >
                  {Array.from({ length: maxKeyLength + 1 }).map((_, index) => (
                    <option key={index} value={index}>
                      {index === maxKeyLength ? "all" : index}
                    </option>
                  ))}
                </select>{" "}
                key argument
                {keyLength > 1 || keyLength === maxKeyLength ? "s" : ""}
              </Text>
            )}
          </div>
          {keyLength > 0 && (
            <div className={css({ display: "contents" })}>
              <div
                className={css({
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                })}
              >
                <CodecParam
                  shape={lengthLimitedKeyShapeDecoder.shape}
                  onChangeValue={setKey}
                />
              </div>
            </div>
          )}
        </section>
      )}
      <Button
        disabled={
          keyShapeDecoder !== undefined &&
          lengthLimitedKey.some((key) => key === INVALID || key === INCOMPLETE)
        }
        onClick={() =>
          onAddQuery({
            id: globalThis.crypto.randomUUID(),
            chainId,
            type: isEntriesQuery ? "storage-entries" : "storage",
            pallet: pallet.name,
            storage: storage.name,
            key: lengthLimitedKey,
          })
        }
        className={css({ gridArea: "submit" })}
      >
        Query
      </Button>
    </>
  );
}

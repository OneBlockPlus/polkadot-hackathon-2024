import type { ConstantQuery, Pallet } from "../types";
import { PalletSelect } from "./pallet-select";
import { Select } from "./select";
import { Button, Code } from "./ui";
import { useChainId } from "@reactive-dot/react";
import Check from "@w3f/polkadot-icons/solid/Check";
import ChevronDown from "@w3f/polkadot-icons/solid/ChevronDown";
import { useState, type ReactNode } from "react";
import { css } from "styled-system/css";

export type ConstantQueryFormProps = {
  pallet: Pallet;
  palletSelect: ReactNode;
  onAddQuery: (query: ConstantQuery) => void;
};

export function ConstantQueryForm(
  props: Omit<ConstantQueryFormProps, "pallet" | "palletSelect">,
) {
  return (
    <PalletSelect filter={(pallet) => pallet.constants.length > 0}>
      {({ pallet, palletSelect }) => (
        <_ConstantQueryForm
          key={pallet.index}
          pallet={pallet}
          palletSelect={palletSelect}
          {...props}
        />
      )}
    </PalletSelect>
  );
}

export function _ConstantQueryForm({
  pallet,
  palletSelect,
  onAddQuery,
}: ConstantQueryFormProps) {
  const chainId = useChainId();
  const defaultConstantName = pallet.constants.at(0)?.name;

  if (defaultConstantName === undefined) {
    throw new Error("Pallet doesn't contains any constant");
  }

  const [selectedConstantName, setSelectedConstantName] =
    useState(defaultConstantName);
  const selectedConstant = pallet.constants.find(
    (constant) => constant.name === selectedConstantName,
  );

  const constantItems = pallet.constants
    .map((constant) => ({
      label: constant.name,
      value: constant.name,
    }))
    .toSorted((a, b) => a.label.localeCompare(b.label));

  return (
    <div
      className={css({
        display: "grid",
        gridTemplateAreas: `
        "pallet storage"
        "submit submit"
        "docs   docs"
      `,
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        gap: "1rem",
      })}
    >
      {palletSelect}
      <Select
        label="Constant"
        options={constantItems}
        value={selectedConstantName}
        onChangeValue={setSelectedConstantName}
      />
      {selectedConstant && (
        <Code
          className={css({
            gridArea: "docs",
            display: "block",
            whiteSpace: "pre-wrap",
            padding: "1rem",
          })}
        >
          {selectedConstant.docs.join("\n")}
        </Code>
      )}
      <Button
        onClick={() =>
          onAddQuery({
            id: globalThis.crypto.randomUUID(),
            chainId,
            type: "constant",
            pallet: pallet.name,
            constant: selectedConstantName,
          })
        }
        className={css({ gridArea: "submit" })}
      >
        Query
      </Button>
    </div>
  );
}

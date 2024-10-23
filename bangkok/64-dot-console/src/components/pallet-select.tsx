import { useMetadata } from "../hooks/metadata";
import type { Pallet } from "../types";
import { Select } from "./select";
import { atom, useAtom } from "jotai";
import { useState, type ReactNode } from "react";

export type PalletSelectProps = {
  filter: (pallet: Pallet) => boolean;
  children: (props: {
    pallet: Pallet;
    palletSelect: ReactNode;
    unstable_changePallet: (palletIndex: number) => void;
  }) => ReactNode;
};

const previouslySelectedPalletAtom = atom<number | undefined>();

export function PalletSelect({ filter, children }: PalletSelectProps) {
  const metadata = useMetadata();
  const pallets = metadata.value.pallets.filter(filter);

  const [previouslySelectedPallet, setPreviouslySelectedPallet] = useAtom(
    previouslySelectedPalletAtom,
  );

  const defaultPallet =
    pallets.find((pallet) => pallet.index === previouslySelectedPallet) ??
    pallets.at(0);

  if (defaultPallet === undefined) {
    throw new Error("Metadata doesn't contain any pallet");
  }

  const [selectedPallet, _setSelectedPallet] = useState(defaultPallet.index);

  const setSelectedPallet = (index: number) => {
    _setSelectedPallet(index);
    setPreviouslySelectedPallet(index);
  };

  const palletItems = pallets
    .map((pallet) => ({ label: pallet.name, value: pallet.index }))
    .toSorted((a, b) => a.label.localeCompare(b.label));

  return children({
    pallet: pallets.find((pallet) => pallet.index === selectedPallet)!,
    unstable_changePallet: (palletIndex) => setSelectedPallet(palletIndex),
    palletSelect: (
      <Select
        label="Pallet"
        options={palletItems}
        value={selectedPallet}
        onChangeValue={setSelectedPallet}
      />
    ),
  });
}

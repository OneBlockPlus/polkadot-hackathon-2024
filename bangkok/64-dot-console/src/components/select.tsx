import { Select as BaseSelect } from "./ui";
import { createListCollection } from "@ark-ui/react";
import Check from "@w3f/polkadot-icons/solid/Check";
import ChevronDown from "@w3f/polkadot-icons/solid/ChevronDown";
import type { ReactNode } from "react";
import { css } from "styled-system/css";

type Option<T> = { label: string; value: T };

export type SelectProps<
  TValue extends string | number,
  TOption extends Option<TValue>,
> = {
  value: TValue | undefined;
  renderValue?: (option: TOption) => ReactNode;
  onChangeValue: (value: TValue) => void;
  options: TOption[];
  renderOption?: (option: TOption) => ReactNode;
  label?: string;
  placeholder?: string;
};

export function Select<
  TValue extends string | number,
  TOption extends Option<TValue>,
>({
  value,
  renderValue,
  onChangeValue,
  options,
  renderOption,
  label,
  placeholder,
}: SelectProps<TValue, TOption>) {
  const collection = createListCollection({
    items: options,
    itemToValue: (option) => String(option.value),
    itemToString: (option) => option.label,
  });

  const selectedOption = collection.find(String(value));

  return (
    <BaseSelect.Root
      collection={collection}
      value={value === undefined ? [] : [String(value)]}
      onValueChange={(event) => {
        const value = event.value.at(0);
        const selectedValue = collection.items.find(
          (item) => String(item.value) === value,
        );

        if (selectedValue !== undefined) {
          onChangeValue(selectedValue.value);
        }
      }}
      positioning={{ fitViewport: true, sameWidth: true }}
    >
      {label !== undefined && <BaseSelect.Label>{label}</BaseSelect.Label>}
      <BaseSelect.Control>
        <BaseSelect.Trigger
          style={renderValue !== undefined ? { height: "unset" } : undefined}
        >
          {selectedOption && renderValue !== undefined ? (
            renderValue(selectedOption)
          ) : (
            <BaseSelect.ValueText placeholder={placeholder ?? ""} />
          )}
          <BaseSelect.Indicator>
            <ChevronDown fill="currentcolor" />
          </BaseSelect.Indicator>
        </BaseSelect.Trigger>
      </BaseSelect.Control>
      <BaseSelect.Positioner>
        <BaseSelect.Content
          className={css({
            maxHeight: "max(50dvh, 8rem)",
            overflow: "auto",
            gap: "0.5rem",
          })}
        >
          {collection.items.map((item) => (
            <BaseSelect.Item key={item.value} item={item}>
              {renderOption?.(item) ?? (
                <>
                  <BaseSelect.ItemText>{item.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator>
                    <Check fill="currentcolor" />
                  </BaseSelect.ItemIndicator>
                </>
              )}
            </BaseSelect.Item>
          ))}
        </BaseSelect.Content>
      </BaseSelect.Positioner>
    </BaseSelect.Root>
  );
}

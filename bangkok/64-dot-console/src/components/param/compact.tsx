import { Input } from "../ui";
import type { ParamProps } from "./common";
import { useEffect, useState } from "react";

export type CompactParamProps = ParamProps<number | bigint> & {
  compact: { codec: "compactNumber" | "compactBn" };
  defaultValue: { value: number | bigint } | undefined;
};

export function CompactParam({
  compact,
  defaultValue,
  onChangeValue,
}: CompactParamProps) {
  const [value, setValue] = useState(defaultValue?.value.toString() ?? "");

  const isBig = compact.codec === "compactBn";

  useEffect(
    () => {
      onChangeValue(isBig ? BigInt(value) : Number(value));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value],
  );

  return (
    <Input
      type="number"
      inputMode="numeric"
      placeholder="Compact"
      value={value}
      min={
        isBig
          ? "-57896044618658097711785492504343953926634992332820282019728792003956564819968"
          : -2147483648
      }
      max={isBig ? "170141183460469231731687303715884105727" : 4294967295}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}

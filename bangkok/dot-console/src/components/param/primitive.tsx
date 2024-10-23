import { Input, Switch } from "../ui";
import type { ParamProps } from "./common";
import type { PrimitiveDecoded } from "@polkadot-api/view-builder";
import { type ChangeEvent, useEffect, useState } from "react";

type ComplexPrimitive =
  | "AccountId"
  | "Bytes"
  | "BytesArray"
  | "_void"
  | "bitSequence"
  | "compactBn"
  | "compactNumber"
  | "ethAccount";

export type PrimitiveParamProps = ParamProps<
  string | boolean | number | bigint
> & {
  primitive: {
    codec: Exclude<PrimitiveDecoded["codec"], ComplexPrimitive>;
  };
  defaultValue: { value: boolean | number | string } | undefined;
};

export function PrimitiveParam({
  primitive,
  defaultValue,
  onChangeValue,
}: PrimitiveParamProps) {
  const [value, setValue] = useState(defaultValue?.value.toString() ?? "");

  const commonProps = {
    placeholder: primitive.codec,
    value,
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      setValue(event.target.value),
  };

  const commonNumberProps = {
    ...commonProps,
    type: "number",
    inputMode: "numeric",
  } as const;

  useEffect(
    () => {
      switch (primitive.codec) {
        case "bool":
          onChangeValue(Boolean(value));
          break;
        case "char":
        case "str":
          onChangeValue(value);
          break;
        case "u8":
        case "i8":
        case "u16":
        case "i16":
        case "u32":
        case "i32":
          onChangeValue(Number(value));
          break;
        case "u64":
        case "i64":
        case "u128":
        case "i128":
        case "u256":
        case "i256":
          onChangeValue(BigInt(value));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value],
  );

  switch (primitive.codec) {
    case "bool":
      return (
        <Switch
          checked={Boolean(value)}
          onCheckedChange={(event) => setValue(String(event.checked))}
        />
      );
    case "char":
      return <Input {...commonProps} maxLength={1} />;
    case "str":
      return <Input {...commonProps} />;
    case "i8":
      return <Input {...commonNumberProps} min={-128} max={127} />;
    case "u8":
      return <Input {...commonNumberProps} min={0} max={255} />;
    case "i16":
      return <Input {...commonNumberProps} min={-32768} max={32767} />;
    case "u16":
      return <Input {...commonNumberProps} min={0} max={65535} />;
    case "i32":
      return (
        <Input {...commonNumberProps} min={-2147483648} max={2147483647} />
      );
    case "u32":
      return <Input {...commonNumberProps} min={0} max={4294967295} />;
    case "i64":
      return (
        <Input
          {...commonNumberProps}
          min="-9223372036854775808"
          max="9223372036854775807"
        />
      );
    case "u64":
      return (
        <Input {...commonNumberProps} min={0} max="18446744073709551615" />
      );
    case "i128":
      return (
        <Input
          {...commonNumberProps}
          min="-170141183460469231731687303715884105728"
          max="170141183460469231731687303715884105727"
        />
      );
    case "u128":
      return (
        <Input
          {...commonNumberProps}
          min={0}
          max="340282366920938463463374607431768211455"
        />
      );
    case "i256":
      return (
        <Input
          {...commonNumberProps}
          min="-57896044618658097711785492504343953926634992332820282019728792003956564819968"
          max="57896044618658097711785492504343953926634992332820282019728792003956564819967"
        />
      );
    case "u256":
      return (
        <Input
          {...commonNumberProps}
          min={0}
          max="115792089237316195423570985008687907853269984665640564039457584007913129639935"
        />
      );
  }
}

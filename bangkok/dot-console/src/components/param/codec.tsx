import { AccountIdParam, type AccountIdParamProps } from "./accountId";
import { ArrayParam, type ArrayParamProps } from "./array";
import { BinaryParam, type BinaryParamProps } from "./binary";
import { type ParamProps } from "./common";
import { CompactParam, type CompactParamProps } from "./compact";
import { EnumParam, type EnumParamProps } from "./enum";
import { OptionParam, type OptionParamProps } from "./options";
import { PrimitiveParam, type PrimitiveParamProps } from "./primitive";
import { SequenceParam, type SequenceParamProps } from "./sequence";
import { StructParam, type StructParamProps } from "./struct";
import { TupleParam, type TupleParamProps } from "./tuple";
import { VoidParam, type VoidParamProps } from "./void";
import type { Decoded, Shape } from "@polkadot-api/view-builder";
import { createContext, Suspense, useContext, useMemo } from "react";
import { css } from "styled-system/css";
import { type CssProperties } from "styled-system/types";

const StorageParamDepthContext = createContext(0);

export type CodecParamProps<T = unknown> = ParamProps<T> & {
  shape: Shape;
  defaultValue?: Decoded | undefined;
};

export function CodecParam<T = unknown>({
  shape,
  ...props
}: CodecParamProps<T>) {
  const depth = useContext(StorageParamDepthContext);

  return (
    <div
      className={css({
        paddingTop: "0.5rem",
        "&:empty": {
          display: "none",
        },
      })}
      style={{
        ["--storage-depth" as keyof CssProperties]: depth,
        borderLeft: depth <= 0 ? undefined : "1px dotted",
        paddingLeft: depth <= 0 ? undefined : "1rem",
      }}
    >
      <StorageParamDepthContext.Provider value={depth + 1}>
        {useMemo(() => {
          switch (shape.codec) {
            case "_void":
              return <VoidParam {...(props as VoidParamProps)} />;
            case "Option":
              return (
                <OptionParam
                  {...(props as OptionParamProps<unknown>)}
                  option={shape}
                />
              );
            case "Enum":
              return <EnumParam {...(props as EnumParamProps)} enum={shape} />;
            case "AccountId":
            case "ethAccount":
              return (
                // TODO: investigate why this keep suspending on every render
                <Suspense>
                  <AccountIdParam
                    {...(props as AccountIdParamProps)}
                    // @ts-expect-error TypeScript bug
                    accountId={shape}
                  />
                </Suspense>
              );
            case "Sequence":
              return (
                <SequenceParam
                  {...(props as SequenceParamProps<unknown>)}
                  sequence={shape}
                />
              );
            case "Array":
              return (
                <ArrayParam
                  {...(props as ArrayParamProps<unknown>)}
                  array={shape}
                />
              );
            case "Tuple":
              return (
                <TupleParam
                  {...(props as TupleParamProps<unknown[]>)}
                  tuple={shape}
                />
              );
            case "Struct":
              return (
                <StructParam
                  {...(props as StructParamProps<Record<string, unknown>>)}
                  struct={shape}
                />
              );
            case "Bytes":
            case "BytesArray":
              return <BinaryParam {...(props as BinaryParamProps)} />;
            case "compactBn":
            case "compactNumber":
              return (
                <CompactParam
                  {...(props as CompactParamProps)}
                  // @ts-expect-error TypeScript bug
                  compact={shape}
                />
              );
            case "bool":
            case "char":
            case "i128":
            case "i16":
            case "i256":
            case "i32":
            case "i64":
            case "i8":
            case "str":
            case "u128":
            case "u16":
            case "u256":
            case "u32":
            case "u64":
            case "u8":
              return (
                <PrimitiveParam
                  {...(props as PrimitiveParamProps)}
                  // @ts-expect-error TypeScript bug
                  primitive={shape}
                />
              );
            case "bitSequence":
            case "Result":
              throw new Error("Unsupported codec type", { cause: shape.codec });
          }
        }, [props, shape])}
      </StorageParamDepthContext.Provider>
    </div>
  );
}

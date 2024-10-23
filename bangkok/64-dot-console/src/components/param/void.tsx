import type { ParamProps } from "./common";
import { useEffect } from "react";

export type VoidParamProps = ParamProps<undefined>;

export function VoidParam({ onChangeValue }: VoidParamProps) {
  useEffect(() => {
    onChangeValue(undefined);
  }, [onChangeValue]);

  return null;
}

import { unbinary } from "../utils";
import { Code } from "./ui";
import JsonView from "react18-json-view";
import { css, cx } from "styled-system/css";

export type CodecViewProps = {
  value: unknown;
  className?: string;
};

export function CodecView({ value, className }: CodecViewProps) {
  return (
    <Code
      className={cx(css({ display: "block", padding: "0.5rem" }), className)}
    >
      <JsonView src={unbinary(value)} theme="atom" dark />
    </Code>
  );
}

import { useMetadata } from "../hooks/metadata";
import type { RuntimeApi, RuntimeApiMethod, RuntimeApiQuery } from "../types";
import { CodecParam, INCOMPLETE, INVALID } from "./param";
import { Select } from "./select";
import { Button, Code } from "./ui";
import { useChainId } from "@reactive-dot/react";
import { useState } from "react";
import { css } from "styled-system/css";
import { useViewBuilder } from "~/hooks/view-builder";

export type RuntimeApiFormProps = {
  onAddQuery: (query: RuntimeApiQuery) => void;
};

export function RuntimeApiForm(props: RuntimeApiFormProps) {
  const metadata = useMetadata();
  const apis = metadata.value.apis;

  const [selectedApiName, setSelectedApiName] = useState(apis.at(0)!.name);
  const selectedApi = apis.find((api) => api.name === selectedApiName);

  const apiItems = apis
    .map((api) => ({ label: api.name, value: api.name }))
    .toSorted((a, b) => a.label.localeCompare(b.label));

  return (
    <div
      className={css({
        display: "grid",
        gridTemplateAreas: `
          "api    method"
          "args   args"
          "submit submit"
          "docs   docs"
        `,
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        gap: "1rem",
      })}
    >
      <Select
        label="API"
        options={apiItems}
        value={selectedApiName}
        onChangeValue={setSelectedApiName}
      />
      {selectedApi && <ApiMethodSelect {...props} api={selectedApi} />}
    </div>
  );
}

type ApiMethodSelectProps = {
  api: RuntimeApi;
  onAddQuery: (query: RuntimeApiQuery) => void;
};

function _ApiMethodSelect({ api, ...props }: ApiMethodSelectProps) {
  const methods = api.methods;
  const [selectedMethodName, setSelectedMethodName] = useState(
    methods.at(0)!.name,
  );
  const selectedMethod = methods.find(
    (method) => method.name === selectedMethodName,
  );

  const methodItems = methods
    .map((method) => ({ label: method.name, value: method.name }))
    .toSorted((a, b) => a.label.localeCompare(b.label));

  return (
    <>
      <Select
        label="Method"
        options={methodItems}
        value={selectedMethodName}
        onChangeValue={setSelectedMethodName}
      />
      {selectedMethod !== undefined && (
        <Code
          className={css({
            gridArea: "docs",
            display: "block",
            whiteSpace: "pre-wrap",
            padding: "1rem",
          })}
        >
          {selectedMethod.docs.join("\n")}
        </Code>
      )}
      {selectedMethod && (
        <ApiMethodArguments {...props} api={api} method={selectedMethod} />
      )}
    </>
  );
}

function ApiMethodSelect(props: ApiMethodSelectProps) {
  return <_ApiMethodSelect key={props.api.name} {...props} />;
}

type ApiMethodArgumentsProps = {
  api: RuntimeApi;
  method: RuntimeApiMethod;
  onAddQuery: (query: RuntimeApiQuery) => void;
};

function ApiMethodArguments(props: ApiMethodArgumentsProps) {
  return <_ApiMethodArguments key={props.method.name} {...props} />;
}

function _ApiMethodArguments({
  api,
  method,
  onAddQuery,
}: ApiMethodArgumentsProps) {
  const chainId = useChainId();
  const viewBuilder = useViewBuilder();

  const [args, setArgs] = useState(
    Array.from({ length: method.inputs.length }).fill(INCOMPLETE),
  );

  const parsedArgs = args.includes(INCOMPLETE)
    ? INCOMPLETE
    : args.includes(INVALID)
      ? INVALID
      : args;

  return (
    <>
      {method.inputs.length > 0 && (
        <div
          className={css({
            gridArea: "args",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          })}
        >
          {method.inputs.map((input, index) => (
            <CodecParam
              key={input.name}
              shape={viewBuilder.buildDefinition(input.type).shape}
              onChangeValue={(value) =>
                setArgs((args) => args.with(index, value))
              }
            />
          ))}
        </div>
      )}
      <Button
        disabled={parsedArgs === INVALID || parsedArgs === INCOMPLETE}
        onClick={() =>
          onAddQuery({
            id: globalThis.crypto.randomUUID(),
            chainId,
            type: "api",
            api: api.name,
            method: method.name,
            args,
          })
        }
        className={css({ gridArea: "submit" })}
      >
        Query
      </Button>
    </>
  );
}

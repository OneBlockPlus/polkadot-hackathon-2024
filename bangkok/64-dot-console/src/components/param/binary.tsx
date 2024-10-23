import { Button, FileUpload, IconButton, Input, Switch } from "../ui";
import { INCOMPLETE, type ParamInput, type ParamProps } from "./common";
import { Binary } from "@polkadot-api/substrate-bindings";
import Delete from "@w3f/polkadot-icons/solid/DeleteCancel";
import type { HexString } from "polkadot-api";
import { useEffect, useState } from "react";
import { css } from "styled-system/css";

export type BinaryParamProps = ParamProps<Binary> & {
  defaultValue?: { value: HexString } | undefined;
};

export function BinaryParam({ onChangeValue, defaultValue }: BinaryParamProps) {
  const [useFileUpload, setUseFileUpload] = useState(false);

  return (
    <section
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      })}
    >
      <Switch
        checked={useFileUpload}
        onCheckedChange={(event) => setUseFileUpload(event.checked)}
      >
        File upload
      </Switch>
      {useFileUpload ? (
        <FileUploadBinaryParam onChangeValue={onChangeValue} />
      ) : (
        <TextBinaryParam
          defaultValue={defaultValue}
          onChangeValue={onChangeValue}
        />
      )}
    </section>
  );
}

function TextBinaryParam({ onChangeValue, defaultValue }: BinaryParamProps) {
  const [value, setValue] = useState(
    defaultValue !== undefined
      ? Binary.fromHex(defaultValue.value).asText()
      : "",
  );

  useEffect(
    () => {
      if (value.match(/^0x[0-9a-f]+$/i)) {
        onChangeValue(Binary.fromHex(value));
      } else {
        onChangeValue(Binary.fromText(value));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value],
  );

  return (
    <Input
      placeholder="Binary (string or hex)"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}

function FileUploadBinaryParam({ onChangeValue }: BinaryParamProps) {
  const [file, setFile] = useState<ParamInput<File>>(INCOMPLETE);
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer>();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (typeof file === "symbol") {
      return;
    }

    setIsPending(true);
    file
      .arrayBuffer()
      .then(setArrayBuffer)
      .finally(() => setIsPending(false));
  }, [file]);

  useEffect(
    () => {
      if (arrayBuffer !== undefined) {
        onChangeValue(Binary.fromBytes(new Uint8Array(arrayBuffer)));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [arrayBuffer],
  );

  return (
    <FileUpload.Root
      disabled={isPending}
      onFileAccept={(event) => {
        const file = event.files.at(0);

        if (file !== undefined) {
          setFile(file);
        }
      }}
    >
      <FileUpload.Dropzone>
        <FileUpload.Label>Drop your files here</FileUpload.Label>
        <FileUpload.Trigger asChild>
          <Button size="sm">Open Dialog</Button>
        </FileUpload.Trigger>
      </FileUpload.Dropzone>
      <FileUpload.ItemGroup>
        <FileUpload.Context>
          {({ acceptedFiles }) =>
            acceptedFiles.map((file, id) => (
              <FileUpload.Item key={id} file={file}>
                <FileUpload.ItemPreview type="image/*">
                  <FileUpload.ItemPreviewImage />
                </FileUpload.ItemPreview>
                <FileUpload.ItemName />
                <FileUpload.ItemSizeText />
                <FileUpload.ItemDeleteTrigger asChild>
                  <IconButton variant="link" size="sm">
                    <Delete fill="currentcolor" />
                  </IconButton>
                </FileUpload.ItemDeleteTrigger>
              </FileUpload.Item>
            ))
          }
        </FileUpload.Context>
      </FileUpload.ItemGroup>
      <FileUpload.HiddenInput />
    </FileUpload.Root>
  );
}

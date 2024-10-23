import { CodecView } from "../../../components/codec-view";
import { Table } from "../../../components/ui";
import type { BlockInfo } from "../types";
import { Collapsible } from "@ark-ui/react";
import { css } from "styled-system/css";

export type BlockExtrinsicsTableProps = {
  block: BlockInfo;
};

export function BlockExtrinsicsTable({ block }: BlockExtrinsicsTableProps) {
  return (
    <Table.Root>
      <Table.Head>
        <Table.Row>
          <Table.Header>ID</Table.Header>
          <Table.Header>Module</Table.Header>
          <Table.Header>Function</Table.Header>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {block.extrinsics
          ?.filter((extrinsic) => extrinsic !== undefined)
          .map((extrinsic, index) => (
            <Collapsible.Root
              key={index}
              className={css({ display: "contents" })}
            >
              <Collapsible.Trigger
                className={css({ cursor: "pointer" })}
                asChild
              >
                <Table.Row>
                  <Table.Cell>
                    {block.number}-{index}
                  </Table.Cell>
                  <Table.Cell>{extrinsic.call.module}</Table.Cell>
                  <Table.Cell>{extrinsic.call.func}</Table.Cell>
                </Table.Row>
              </Collapsible.Trigger>
              <Collapsible.Content asChild>
                <Table.Row>
                  <Table.Cell colSpan={3} className={css({ padding: 0 })}>
                    <CodecView
                      value={extrinsic.call.args}
                      className={css({ borderRadius: 0 })}
                    />
                  </Table.Cell>
                </Table.Row>
              </Collapsible.Content>
            </Collapsible.Root>
          ))}
      </Table.Body>
    </Table.Root>
  );
}

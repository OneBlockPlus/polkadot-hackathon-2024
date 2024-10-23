import { Button, Heading, Table } from "../../../components/ui";
import { Spinner } from "../../../components/ui/spinner";
import { blockInViewAtom, blocksAtom } from "../stores/blocks";
import { BlockAuthor } from "./block-author";
import { useBlock } from "@reactive-dot/react";
import { useAtomValue, useSetAtom } from "jotai";
import { Fragment } from "react";
import { css } from "styled-system/css";

export type BlocksProps = {
  className?: string | undefined;
};

export function Blocks({ className }: BlocksProps) {
  const blocks = useAtomValue(blocksAtom);
  const finalizedBlock = useBlock("finalized");
  const setBlockInView = useSetAtom(blockInViewAtom);

  return (
    <article>
      <header
        className={css({
          position: "sticky",
          top: 0,
          padding: "0.5rem 1rem",
          backgroundColor: "var(--colors-bg-default)",
          zIndex: 1,
        })}
      >
        <Heading as="h3" size="xl">
          Recent blocks
        </Heading>
      </header>
      <Table.Root className={className}>
        <Table.Caption>Recent blocks</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.Header>Number</Table.Header>
            <Table.Header>Author</Table.Header>
            <Table.Header>EX count</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {blocks.map((block) => (
            <Fragment key={block.hash}>
              {block.number === finalizedBlock.number && (
                <tr>
                  <td colSpan={3}>
                    <div
                      className={css({
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--colors-accent-text)",
                        "&>div": {
                          flex: 1,
                          height: "1px",
                          backgroundColor: "var(--colors-accent-default)",
                        },
                      })}
                    >
                      <div />
                      ⬇️ Finalised ⬇️
                      <div />
                    </div>
                  </td>
                </tr>
              )}
              <Table.Row
                style={{
                  borderBottom:
                    block.number === finalizedBlock.number + 1
                      ? "none"
                      : undefined,
                }}
              >
                <Table.Cell>
                  <Button
                    variant="link"
                    onClick={() => setBlockInView(block.number)}
                    className={css({
                      color: "var(--colors-accent-text)",
                      "&:hover": { textDecoration: "underline" },
                    })}
                  >
                    {block.number.toLocaleString()}
                  </Button>
                </Table.Cell>
                <Table.Cell
                  className={css({ maxWidth: "20rem", overflow: "hidden" })}
                >
                  <BlockAuthor blockHash={block.hash} />
                </Table.Cell>
                <Table.Cell>
                  {block.extrinsics?.length.toLocaleString() ?? <Spinner />}
                </Table.Cell>
              </Table.Row>
            </Fragment>
          ))}
        </Table.Body>
      </Table.Root>
    </article>
  );
}

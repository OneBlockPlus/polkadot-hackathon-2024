import {
  Button,
  Drawer,
  Heading,
  IconButton,
  Link,
  Text,
} from "../components/ui";
import { Spinner } from "../components/ui/spinner";
import type { ChainId } from "@reactive-dot/core";
import { ChainProvider, useChainIds } from "@reactive-dot/react";
import {
  createFileRoute,
  Outlet,
  Link as RouterLink,
} from "@tanstack/react-router";
import CloseIcon from "@w3f/polkadot-icons/solid/Close";
import { ConnectionButton } from "dot-connect/react.js";
import { Suspense, useEffect, useState } from "react";
import { css } from "styled-system/css";

type Search = {
  chain?: string | undefined;
};

export const Route = createFileRoute("/_layout")({
  component: Layout,
  validateSearch: (input): Search => ({
    chain: input["chain"] as ChainId | undefined,
  }),
});

function Layout() {
  const chainIds = useChainIds();

  const { chain: _searchChainId } = Route.useSearch();
  const searchChainId = _searchChainId?.replaceAll("-", "_") as
    | ChainId
    | undefined;

  const [chainId, setChainId] = useState<ChainId>(searchChainId ?? "polkadot");

  useEffect(() => {
    if (searchChainId !== undefined) {
      setChainId(searchChainId);
    }
  }, [searchChainId]);

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
      })}
    >
      <header
        className={css({
          display: "grid",
          gridTemplateAreas: `
            "branding       wallet-connection"
            "nav            nav"
          `,
          gridTemplateColumns: "max-content 1fr",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem 2rem",
          borderBottom: "1px solid",
          "@media(min-width: 68rem)": {
            gridTemplateAreas: `"branding nav wallet-connection"`,
            gridTemplateColumns: "max-content 1fr max-content",
          },
        })}
      >
        <section className={css({ gridArea: "branding" })}>
          <RouterLink to="/">
            <Heading as="h1" size="2xl">
              📟 ĐÓTConsole
            </Heading>
          </RouterLink>
          <Text as="p" size="xs" className={css({ fontFamily: "monospace" })}>
            <Link href="https://reactivedot.dev/" target="_blank">
              ReactiveDOT
            </Link>{" "}
            ×{" "}
            <Link href="https://papi.how/" target="_blank">
              PAPI
            </Link>
          </Text>
        </section>
        <div
          className={css({
            gridArea: "nav",
            display: "flex",
            gap: "1rem",
            overflow: "auto",
            "@media(min-width: 68rem)": {
              justifySelf: "end",
              flexDirection: "row-reverse",
            },
          })}
        >
          <Drawer.Root>
            <div
              className={css({
                borderRightWidth: 1,
                borderLeftWidth: 1,
                padding: "0 0.5rem",
              })}
            >
              <Drawer.Trigger asChild>
                <Button
                  variant="ghost"
                  className={css({ textTransform: "capitalize" })}
                >
                  {chainId.replaceAll("_", " ")}
                </Button>
              </Drawer.Trigger>
            </div>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>Chain</Drawer.Title>
                  <Drawer.Description>Select a chain</Drawer.Description>
                  <Drawer.CloseTrigger
                    asChild
                    position="absolute"
                    top="3"
                    right="4"
                  >
                    <IconButton variant="ghost">
                      <CloseIcon fill="currentcolor" />
                    </IconButton>
                  </Drawer.CloseTrigger>
                </Drawer.Header>
                <Drawer.Body className={css({ display: "flex", gap: "1rem" })}>
                  <Drawer.Context>
                    {({ setOpen }) =>
                      chainIds.map((chainId) => (
                        <RouterLink
                          key={chainId}
                          search={{ chain: chainId.replaceAll("_", "-") }}
                          className={css({ display: "contents" })}
                        >
                          <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className={css({ textTransform: "capitalize" })}
                          >
                            {chainId.replaceAll("_", " ")}
                          </Button>
                        </RouterLink>
                      ))
                    }
                  </Drawer.Context>
                </Drawer.Body>
              </Drawer.Content>
            </Drawer.Positioner>
          </Drawer.Root>
          <nav
            className={css({
              display: "flex",
              gap: "1.5rem",
              "@media(min-width: 68rem)": {
                justifyContent: "end",
              },
            })}
          >
            <Link asChild>
              <RouterLink
                to="/explorer"
                activeProps={{ className: css({ color: "accent.default" }) }}
              >
                Explorer
              </RouterLink>
            </Link>
            <Link asChild>
              <RouterLink
                to="/queries"
                activeProps={{ className: css({ color: "accent.default" }) }}
              >
                Queries
              </RouterLink>
            </Link>
            <Link asChild>
              <RouterLink
                to="/extrinsics"
                activeProps={{ className: css({ color: "accent.default" }) }}
              >
                Extrinsics
              </RouterLink>
            </Link>
            <Link asChild>
              <RouterLink
                to="/utilities"
                activeProps={{ className: css({ color: "accent.default" }) }}
              >
                Utilities
              </RouterLink>
            </Link>
            <Link asChild>
              <RouterLink
                to="/accounts"
                activeProps={{ className: css({ color: "accent.default" }) }}
              >
                Accounts
              </RouterLink>
            </Link>
          </nav>
        </div>
        <div
          className={css({
            gridArea: "wallet-connection",
            justifySelf: "end",
            display: "flex",
            alignItems: "center",
          })}
        >
          <div
            className={css({
              marginRight: "1rem",
              borderRightWidth: 1,
              paddingRight: "1rem",
            })}
          >
            <ConnectionButton className={css({})} />
          </div>
          <a
            href="https://github.com/tien/dot-console"
            target="_blanck"
            className={css({ display: "contents" })}
          >
            <svg
              width="1.5rem"
              height="1.5rem"
              viewBox="0 0 98 96"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
                fill="currentcolor"
              />
            </svg>
          </a>
        </div>
      </header>
      <main className={css({ display: "contents" })}>
        <ChainProvider key={chainId} chainId={chainId}>
          <Suspense fallback={<SuspenseFallback />}>
            <Outlet />
          </Suspense>
        </ChainProvider>
      </main>
    </div>
  );
}

function SuspenseFallback() {
  return (
    <div
      className={css({
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.5rem",
        textAlign: "center",
      })}
    >
      <Spinner size="xl" />
      <Text>Loading data</Text>
    </div>
  );
}

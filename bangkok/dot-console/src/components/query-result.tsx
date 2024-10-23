import type { Query } from "../types";
import { stringifyCodec } from "../utils";
import { CodecView } from "./codec-view";
import { Card, Code, FormLabel, IconButton, Progress } from "./ui";
import {
  useLazyLoadQueryWithRefresh,
  useQueryErrorResetter,
} from "@reactive-dot/react";
import Close from "@w3f/polkadot-icons/solid/Close";
import Refresh from "@w3f/polkadot-icons/solid/RefreshRedo";
import {
  type PropsWithChildren,
  Suspense,
  useMemo,
  useTransition,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { css } from "styled-system/css";

type StorageQueryResultProps = {
  query: Query;
  onDelete: () => void;
};

export function QueryResult(props: StorageQueryResultProps) {
  return (
    <QueryErrorBoundary onDelete={props.onDelete}>
      <Suspense fallback={<Progress type="linear" value={null} />}>
        <SuspendableQueryResult {...props} />
      </Suspense>
    </QueryErrorBoundary>
  );
}

function SuspendableQueryResult({ query, onDelete }: StorageQueryResultProps) {
  const queryArgs = useMemo(() => {
    switch (query.type) {
      case "constant":
        return [];
      case "storage":
      case "storage-entries":
        return query.key;
      case "api":
        return query.args;
    }
  }, [query]);

  const [result, refresh] = useLazyLoadQueryWithRefresh(
    (builder) => {
      switch (query.type) {
        case "constant":
          return builder.getConstant(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            query.pallet as any,
            query.constant,
          );
        case "storage":
          return builder.readStorage(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            query.pallet as any,
            query.storage,
            queryArgs,
          );
        case "storage-entries":
          return builder.readStorageEntries(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            query.pallet as any,
            query.storage,
            queryArgs,
          );
        case "api":
          return builder.callApi(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            query.api as any,
            query.method,
            queryArgs,
          );
      }
    },
    { chainId: query.chainId },
  );

  const refreshable = query.type === "api" || query.type === "storage-entries";
  const [isRefreshing, startRefreshTransition] = useTransition();

  const unwrappedQueryArgs =
    queryArgs.length === 1 ? queryArgs.at(0) : queryArgs;

  const queryPath = useMemo(() => {
    switch (query.type) {
      case "constant":
        return [query.pallet, query.constant] as const;
      case "storage":
      case "storage-entries":
        return [query.pallet, query.storage] as const;
      case "api":
        return [query.api, query.method] as const;
    }
  }, [query]);

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title
          className={css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.5rem",
          })}
        >
          {useMemo(() => {
            switch (query.type) {
              case "constant":
                return "Constant";
              case "storage":
                return "Storage";
              case "storage-entries":
                return "Storage entries";
              case "api":
                return "Runtime API";
            }
          }, [query.type])}
          <div className={css({ display: "flex", gap: "0.5rem" })}>
            {refreshable && (
              <IconButton
                variant="ghost"
                disabled={isRefreshing}
                onClick={() => startRefreshTransition(() => refresh())}
              >
                <Refresh fill="currentcolor" />
              </IconButton>
            )}
            <IconButton variant="ghost" onClick={() => onDelete()}>
              <Close fill="currentcolor" />
            </IconButton>
          </div>
        </Card.Title>
        <Card.Description>
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            })}
          >
            <FormLabel className={css({ display: "block" })}>
              Chain ID: <Code>{query.chainId}</Code>
            </FormLabel>
            <FormLabel className={css({ display: "block" })}>
              Path: <Code>{queryPath.join("/")}</Code>
            </FormLabel>
            {queryArgs.length > 0 && (
              <FormLabel className={css({ display: "block" })}>
                Key: <Code>{stringifyCodec(unwrappedQueryArgs)}</Code>
              </FormLabel>
            )}
          </div>
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <FormLabel className={css({ marginBottom: "0.5rem" })}>
          Result
        </FormLabel>
        <CodecView value={result} />
      </Card.Body>
    </Card.Root>
  );
}

type QueryErrorBoundaryProps = PropsWithChildren<{
  onDelete: () => void;
}>;

function QueryErrorBoundary({ onDelete, children }: QueryErrorBoundaryProps) {
  const resetQueryError = useQueryErrorResetter();

  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <Card.Root>
          <Card.Header>
            <Card.Title
              className={css({
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "rem",
              })}
            >
              <div>Error fetching query</div>
              <IconButton
                variant="ghost"
                onClick={() => resetErrorBoundary(error)}
              >
                <Close fill="currentcolor" />
              </IconButton>
            </Card.Title>
          </Card.Header>
        </Card.Root>
      )}
      onReset={(details) => {
        onDelete();
        if (details.reason === "imperative-api") {
          const [error] = details.args;
          resetQueryError(error);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

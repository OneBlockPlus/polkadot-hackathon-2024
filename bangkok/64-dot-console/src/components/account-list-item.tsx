import { Heading, Text } from "./ui";
import { Icon } from "./ui/icon";
import { idle } from "@reactive-dot/core";
import { useLazyLoadQuery } from "@reactive-dot/react";
import IdentityIcon from "@w3f/polkadot-icons/solid/Identity";
import SubIdentityIcon from "@w3f/polkadot-icons/solid/Infrastructure";
import { PolkadotIdenticon } from "dot-identicon/react.js";
import { Suspense } from "react";
import { css, cx } from "styled-system/css";
import { usePeopleChainId } from "~/hooks/chain";

export type AccountListItemProps = {
  address: string;
  name: string | undefined;
  className?: string;
};

export function AccountListItem(props: AccountListItemProps) {
  return (
    <Suspense
      fallback={
        <AccountListItemTemplate
          address={props.address}
          displayName={props.name}
        />
      }
    >
      <SuspendableAccountListItem {...props} />
    </Suspense>
  );
}

export function SuspendableAccountListItem({
  address,
  name,
  className,
}: AccountListItemProps) {
  const identity = useLazyLoadQuery(
    (builder) => builder.readStorage("Identity", "IdentityOf", [address]),
    { chainId: usePeopleChainId() },
  );

  const superIdentity = useLazyLoadQuery(
    (builder) =>
      identity !== undefined
        ? undefined
        : builder.readStorage("Identity", "SuperOf", [address]),
    { chainId: usePeopleChainId() },
  );

  const superAccountIdentity = useLazyLoadQuery(
    (builder) =>
      superIdentity === idle || superIdentity === undefined
        ? undefined
        : builder.readStorage("Identity", "IdentityOf", [superIdentity[0]]),
    { chainId: usePeopleChainId() },
  );

  const identityDisplay =
    identity?.[0]?.info.display.value?.asText() ??
    (superIdentity === idle ||
    superIdentity === undefined ||
    superAccountIdentity === idle ||
    superAccountIdentity === undefined
      ? undefined
      : `${superAccountIdentity[0].info.display.value?.asText()}/${superIdentity[1].value?.asText()}`);

  const displayName = identityDisplay ?? name;

  const hasOnChainIdentity = identity !== undefined;

  const isSubIdentity =
    !hasOnChainIdentity &&
    superIdentity !== idle &&
    superIdentity !== undefined;

  return (
    <AccountListItemTemplate
      address={address}
      displayName={displayName}
      displayNameType={
        hasOnChainIdentity
          ? "on-chain"
          : isSubIdentity
            ? "sub-identity"
            : undefined
      }
      className={className}
    />
  );
}

type AccountListItemTemplateProps = {
  address: string;
  displayName?: string | undefined;
  displayNameType?: "on-chain" | "sub-identity" | undefined;
  className?: string | undefined;
};

function AccountListItemTemplate({
  address,
  displayName,
  displayNameType: identityType,
  className,
}: AccountListItemTemplateProps) {
  return (
    <article
      className={cx(
        className,
        css({
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "0.5rem",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }),
      )}
    >
      <PolkadotIdenticon
        address={address}
        size="2.2rem"
        backgroundColor="var(--colors-fg-default)"
      />
      <div className={css({ overflow: "hidden" })}>
        <header
          title={(() => {
            switch (identityType) {
              case "on-chain":
                return "On-chain identity";
              case "sub-identity":
                return "Sub-account";
              default:
                return undefined;
            }
          })()}
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            overflow: "hidden",
          })}
        >
          {(() => {
            switch (identityType) {
              case "on-chain":
                return (
                  <Icon size="sm">
                    <IdentityIcon fill="var(--colors-accent-emphasized)" />
                  </Icon>
                );
              case "sub-identity":
                return (
                  <Icon size="sm">
                    <SubIdentityIcon fill="var(--colors-accent-emphasized)" />
                  </Icon>
                );
              default:
                return undefined;
            }
          })()}
          <Heading
            className={css({
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            })}
            style={
              identityType === undefined
                ? undefined
                : { color: "var(--colors-accent-emphasized)" }
            }
          >
            {displayName ?? (
              <span
                className={css({
                  fontFamily: "monospace",
                  display: "contents",
                })}
              >
                {address}
              </span>
            )}
          </Heading>
        </header>
        {displayName !== undefined && (
          <Text
            className={css({
              fontFamily: "monospace",
              overflow: "hidden",
              textOverflow: "ellipsis",
            })}
          >
            {address}
          </Text>
        )}
      </div>
    </article>
  );
}

import { Card, Heading, Text } from "../../components/ui";
import type { PolkadotAccount } from "@reactive-dot/core";
import {
  useAccounts,
  useLazyLoadQuery,
  useNativeTokenAmountFromPlanck,
  useSpendableBalance,
} from "@reactive-dot/react";
import type { DenominatedNumber } from "@reactive-dot/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Fragment, Suspense } from "react";
import { css } from "styled-system/css";
import { AccountListItem } from "~/components/account-list-item";
import { Spinner } from "~/components/ui/spinner";
import { usePeopleChainId } from "~/hooks/chain";

export const Route = createFileRoute("/_layout/accounts")({
  component: AccountsPage,
});

function AccountsPage() {
  const accounts = useAccounts();

  return (
    <section
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "2rem 4rem",
      })}
    >
      {accounts.map((account) => (
        <AccountItem
          key={account.wallet.id + account.address}
          account={account}
        />
      ))}
    </section>
  );
}

type AccountItemProps = {
  account: PolkadotAccount;
};

function AccountItem({ account }: AccountItemProps) {
  return (
    <Card.Root>
      <Card.Header
        className={css({
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "0.5rem",
        })}
      >
        <AccountListItem address={account.address} name={account.name} />
      </Card.Header>
      <Card.Body className={css({ "& dd": { fontWeight: "bold" } })}>
        <AccountBalances account={account} />
        <AccountIdentity account={account} />
      </Card.Body>
    </Card.Root>
  );
}

type AccountBalancesProps = {
  account: PolkadotAccount;
};

function AccountBalances(props: AccountBalancesProps) {
  return (
    <Suspense
      fallback={
        <AccountBalancesTemplate
          spendable="pending"
          free="pending"
          frozen="pending"
          reserved="pending"
        />
      }
    >
      <SuspendableAccountBalances {...props} />
    </Suspense>
  );
}

function SuspendableAccountBalances({ account }: AccountBalancesProps) {
  const systemAccount = useLazyLoadQuery((builder) =>
    builder.readStorage("System", "Account", [account.address]),
  );

  const { free, frozen, reserved } = systemAccount.data;

  const spendable = useSpendableBalance(account.address, {
    includesExistentialDeposit: true,
  });

  return (
    <AccountBalancesTemplate
      spendable={spendable}
      free={useNativeTokenAmountFromPlanck(free)}
      frozen={useNativeTokenAmountFromPlanck(frozen)}
      reserved={useNativeTokenAmountFromPlanck(reserved)}
    />
  );
}

type AccountBalancesTemplateProps = {
  spendable: DenominatedNumber | "pending";
  free: DenominatedNumber | "pending";
  frozen: DenominatedNumber | "pending";
  reserved: DenominatedNumber | "pending";
};

function AccountBalancesTemplate({
  spendable,
  free,
  frozen,
  reserved,
}: AccountBalancesTemplateProps) {
  const Amount = ({ value }: { value: DenominatedNumber | "pending" }) => (
    <Text
      as="dd"
      color={value === "pending" || value.planck === 0n ? undefined : "green"}
    >
      {value === "pending" ? <Spinner /> : value.toLocaleString()}
    </Text>
  );

  return (
    <dl className={css({ display: "flex", gap: "1rem", "&>*": { flex: 1 } })}>
      <div>
        <dt>Spendable</dt>
        <Amount value={spendable} />
      </div>
      <div>
        <dt>Free</dt>
        <Amount value={free} />
      </div>
      <div>
        <dt>Frozen</dt>
        <Amount value={frozen} />
      </div>
      <div>
        <dt>Reserved</dt>
        <Amount value={reserved} />
      </div>
    </dl>
  );
}

type AccountIdentityProps = {
  account: PolkadotAccount;
};

export function AccountIdentity(props: AccountIdentityProps) {
  return (
    <Suspense>
      <SuspendableAccountIdentity {...props} />
    </Suspense>
  );
}

export function SuspendableAccountIdentity({ account }: AccountIdentityProps) {
  const result = useLazyLoadQuery(
    (builder) =>
      builder
        .readStorage("Identity", "IdentityOf", [account.address])
        .readStorage("Identity", "SuperOf", [account.address]),
    { chainId: usePeopleChainId() },
  );

  const [registration, username] = result[0] ?? [];
  const [superAddress, subName] = result[1] ?? [];

  if (registration === undefined && subName === undefined) {
    return null;
  }

  const { additional, pgp_fingerprint, ...knowns } =
    registration === undefined
      ? { additional: undefined, pgp_fingerprint: undefined }
      : "additional" in registration.info
        ? registration.info
        : { ...registration.info, additional: undefined };

  return (
    <section>
      <header className={css({ margin: "1rem 0 0.5rem 0" })}>
        <Heading as="h3" size="xl">
          Identity
        </Heading>
      </header>
      <dl
        className={css({
          display: "grid",
          gridTemplateColumns: "max-content minmax(0, 1fr)",
          gap: "0.5rem",
        })}
      >
        {superAddress !== undefined && subName !== undefined && (
          <>
            <dt>Super-identity</dt>
            <dd>{superAddress}</dd>
            <dt>Sub-identity</dt>
            <dd>{subName.value?.asText()}</dd>
          </>
        )}
        {username !== undefined && (
          <>
            <dt>Username</dt>
            <dd>{username.asText()}</dd>
          </>
        )}
        {Object.entries(knowns)
          .filter(([_, value]) => value.value !== undefined)
          .map(([key, value]) => (
            <Fragment key={key}>
              <dt className={css({ textTransform: "capitalize" })}>{key}</dt>
              <dd>{value.value!.asText()}</dd>
            </Fragment>
          ))}
      </dl>
    </section>
  );
}

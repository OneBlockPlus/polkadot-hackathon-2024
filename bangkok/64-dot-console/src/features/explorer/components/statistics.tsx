import { Heading } from "../../../components/ui";
import { useStakingChainId } from "../../../hooks/chain";
import { idle } from "@reactive-dot/core";
import {
  useBlock,
  useChainId,
  useClient,
  useLazyLoadQuery,
  useNativeTokenAmountFromPlanck,
} from "@reactive-dot/react";
import { differenceInMilliseconds, formatDuration } from "date-fns";
import { useEffect, useState } from "react";
import { css, cx } from "styled-system/css";

export type StatisticsProps = {
  className?: string | undefined;
};

export function Statistics({ className }: StatisticsProps) {
  const totalIssuance = useLazyLoadQuery((builder) =>
    builder.readStorage("Balances", "TotalIssuance", []),
  );

  return (
    <section
      className={cx(
        className,
        css({
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
          "&>*": {
            flex: 1,
            padding: "0 1rem",
          },
          "@media(min-width: 68rem)": {
            flexDirection: "row",
            "&>*:not(:first-child)": {
              borderLeft: "1px solid",
            },
          },
        }),
      )}
    >
      <article>
        <header>
          <Heading as="h3">Block time</Heading>
        </header>
        <div>
          <BlockTime />
        </div>
      </article>
      <article>
        <header>
          <Heading as="h3">Total issuance</Heading>
        </header>
        <div>
          {useNativeTokenAmountFromPlanck(totalIssuance).toLocaleString()}
        </div>
      </article>
      <TotalStaked />
      <article>
        <header>
          <Heading as="h3">Last finalised block</Heading>
        </header>
        <div>
          <FinalizedBlockNumber />
        </div>
      </article>
      <article>
        <header>
          <Heading as="h3">Last best block</Heading>
        </header>
        <div>
          <BestBlockNumber />
        </div>
      </article>
    </section>
  );
}

function BlockTime() {
  const chainId = useChainId();

  if (
    chainId === "kusama" ||
    chainId === "polkadot" ||
    chainId === "paseo" ||
    chainId === "westend"
  ) {
    // eslint-disable-next-line no-var
    var babeChainId = chainId;
  } else {
    // eslint-disable-next-line no-var
    var auraChainId = chainId;
  }

  const expectedBabeBlockTime = useLazyLoadQuery(
    (builder) =>
      babeChainId === undefined
        ? undefined
        : builder.getConstant("Babe", "ExpectedBlockTime"),
    { chainId: babeChainId! },
  );

  const auraSlotDuration = useLazyLoadQuery(
    (builder) =>
      auraChainId === undefined
        ? undefined
        : builder.callApi("AuraApi", "slot_duration", []),
    { chainId: auraChainId! },
  );

  const expectedBlockTime =
    expectedBabeBlockTime !== idle
      ? expectedBabeBlockTime
      : auraSlotDuration !== idle
        ? auraSlotDuration
        : undefined;

  return (
    <div>
      Target: {formatDuration({ seconds: Number(expectedBlockTime) / 1000 })};
      Actual: <LastBlockTime />
    </div>
  );
}

function LastBlockTime() {
  const formatDistance = (from: Date) =>
    (differenceInMilliseconds(new Date(), from) / 1000).toLocaleString(
      undefined,
      { minimumFractionDigits: 1, maximumFractionDigits: 1 },
    ) + "s";

  const client = useClient();

  const [lastBestBlockNumber, setLastBestBlockNumber] = useState<number>();

  useEffect(() => {
    const subscription = client.bestBlocks$.subscribe({
      next: (bestBlocks) => setLastBestBlockNumber(bestBlocks.at(0)!.number),
    });

    return () => subscription.unsubscribe();
  }, [client.bestBlocks$]);

  const [lastBlockTime, setLastBlockTime] = useState(new Date());

  useEffect(() => {
    setLastBlockTime(new Date());
  }, [lastBestBlockNumber]);

  const [lastBlockTimeToNow, setLastBlockTimeToNow] = useState(() =>
    formatDistance(lastBlockTime),
  );

  useEffect(() => {
    const interval = setInterval(
      () => setLastBlockTimeToNow(formatDistance(lastBlockTime)),
      100,
    );

    return () => clearInterval(interval);
  }, [lastBlockTime]);

  return <span>{lastBlockTimeToNow}</span>;
}

function FinalizedBlockNumber() {
  return useBlock("finalized").number.toLocaleString();
}

function BestBlockNumber() {
  return useBlock("best").number.toLocaleString();
}

function TotalStaked() {
  const chainId = useChainId();
  const stakingChainId = useStakingChainId();

  const activeEra = useLazyLoadQuery(
    (builder) => builder.readStorage("Staking", "ActiveEra", []),
    { chainId: stakingChainId },
  );

  const queryResult = useLazyLoadQuery(
    (builder) =>
      activeEra === undefined
        ? false
        : builder
            .readStorage("Staking", "ErasTotalStake", [activeEra.index])
            .readStorage("NominationPools", "TotalValueLocked", []),
    { chainId: stakingChainId },
  );

  return (
    <article>
      <header>
        <Heading as="h3">
          Total staked {chainId !== stakingChainId && `@ relay-chain`}
        </Heading>
      </header>
      <div>
        {useNativeTokenAmountFromPlanck(
          queryResult === idle ? 0n : queryResult[0] + queryResult[1],
          { chainId: stakingChainId },
        ).toLocaleString()}
      </div>
    </article>
  );
}

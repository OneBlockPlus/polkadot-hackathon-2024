import {
  Card,
  Field,
  Link,
  NumberInput,
  Text,
} from "../../../../components/ui";
import { useChainSpecData } from "@reactive-dot/react";
import { DenominatedNumber } from "@reactive-dot/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { css } from "styled-system/css";

export const Route = createFileRoute(
  "/_layout/utilities/_layout/planck-convertor",
)({
  component: PlanckConvertor,
});

function PlanckConvertor() {
  const chainSpecData = useChainSpecData();
  const symbol = chainSpecData.properties.tokenSymbol;
  const decimals = chainSpecData.properties.tokenDecimals;

  const [amount, setAmount] = useState("");
  const [planck, setPlanck] = useState("");

  return (
    <div>
      <Card.Root className={css({ margin: "auto", maxWidth: "34rem" })}>
        <Card.Header>
          <Card.Title>Planck converter</Card.Title>
          <Card.Description>
            Convert {symbol} to and from planck value.
          </Card.Description>
        </Card.Header>
        <Card.Body className={css({ gap: "1rem" })}>
          <Field.Root>
            <Field.Label>{symbol}</Field.Label>
            <NumberInput
              value={amount}
              onValueChange={(event) => {
                setAmount(event.value);
                setPlanck(
                  DenominatedNumber.fromNumber(
                    event.value,
                    decimals,
                  ).planck.toString(),
                );
              }}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label>Planck</Field.Label>
            <NumberInput
              value={planck}
              onValueChange={(event) => {
                setPlanck(event.value);
                setAmount(
                  new DenominatedNumber(event.value, decimals).toString(),
                );
              }}
            />
          </Field.Root>
        </Card.Body>
        <Card.Footer>
          <Text size="sm" fontWeight="light">
            Learn more about the planck unit{" "}
            <Link
              href="https://wiki.polkadot.network/docs/learn-DOT"
              target="_blank"
            >
              here
            </Link>
            .
          </Text>
        </Card.Footer>
      </Card.Root>
    </div>
  );
}

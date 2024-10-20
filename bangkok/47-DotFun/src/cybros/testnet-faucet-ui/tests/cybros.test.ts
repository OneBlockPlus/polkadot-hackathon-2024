import { FaucetTests } from "./faucet.js";

const chains = [
  { name: "Dev (the Origin)", id: -1 },
];

const tests = new FaucetTests({
  faucetName: "Cybros Faucet", chains, url: "/", expectTransactionLink: true
});
tests.runTests();

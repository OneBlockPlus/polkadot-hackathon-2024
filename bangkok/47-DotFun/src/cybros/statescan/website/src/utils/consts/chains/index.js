import { ReactComponent as CybrosOriginIcon } from "../../../components/icons/cybros-origin.svg";

const cybrosOrigin = {
  name: "Cybros Origin",
  icon: <CybrosOriginIcon />,
  identity: "polkadot",
  value: "cybros-origin",
  chain: "cybros",
  symbol: "CBT",
  decimals: 12,
  color: "#3765DC",
  colorSecondary: "rgba(55, 101, 220, 0.1)",
  buttonColor: "#000000",
  modules: {
    identity: false,
  },
  nodes: [
    { name: "Cybros", url: "wss://node-rpc.cybros.network" },
  ],
  useOnChainBlockData: false,
};

const chains = {
  "cybros-origin": cybrosOrigin
};

export default chains;

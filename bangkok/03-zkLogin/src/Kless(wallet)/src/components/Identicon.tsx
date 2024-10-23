import PolkadotIdenticon from "@polkadot/react-identicon";

export const Identicon = ({
  address,
  size,
}: {
  address: string;
  size?: number;
}) => {
  return <PolkadotIdenticon value={address} size={size} theme="beachball" />;
};

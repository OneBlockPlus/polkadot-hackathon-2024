import React from "react";
import classNames from "classnames";
import Identicon from "@polkadot/react-identicon";
import { encodeAddress } from "@polkadot/util-crypto";
import { useApiContext } from "../context/ApiContext";

export const shortenAddress = (address: string, maxLength: number) => {
  if (address.length <= maxLength) {
    return address;
  }

  const startStr = address.slice(0, maxLength / 2 - 1);
  const endStr = address.slice(address.length - maxLength / 2 + 1);

  return `${startStr}...${endStr}`;
};

const Address = (props: {
  address: string;
  name?: string;
  maxLength?: number;
  className?: string;
  identiconSize?: number;
  addressClassName?: string;
}) => {
  const { ss58Format } = useApiContext();
  const {
    address,
    name,
    maxLength,
    className,
    identiconSize,
    addressClassName,
  } = props;
  return (
    <div className={classNames("flex items-center gap-x-2", className)}>
      <Identicon
        className=""
        value={address}
        size={identiconSize ? identiconSize : 25}
        theme={"polkadot"}
      />
      <div id="addressText" className={classNames("m-0 p-0", addressClassName)}>
        {name
          ? name
          : shortenAddress(encodeAddress(address, ss58Format), maxLength || 15)}
      </div>
    </div>
  );
};

export default Address;

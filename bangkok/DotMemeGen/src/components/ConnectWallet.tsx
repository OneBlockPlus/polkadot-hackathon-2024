import { Alert, Button, Modal, Select } from "antd";
import { useState } from "react";
import Address from "./Address";
import AvailableWallets from "./AvailableWallet";
import classNames from "classnames";
import useUserDetailsContext from "../context";
import { poppins } from "../types";

const ConnectWallet = ({ className }: { className?: string }) => {
  const { accounts, loginAddress, setLoginAddress } = useUserDetailsContext();
  const [open, setOpen] = useState(false);
  const accountName = accounts.find(
    (account) => account.address === loginAddress,
  )?.meta?.name;
  const options = accounts
    ? accounts?.map((account) => {
        return {
          label: (
            <Address address={account.address} name={account?.meta?.name} />
          ),
          value: account.address,
        };
      })
    : [];

  return (
    <div className={className}>
      <Button
        type="default"
        htmlType="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center h-8 py-1 text-primaryButton"
      >
        {!loginAddress ? (
          "Connect Wallet"
        ) : (
          <Address
            identiconSize={18}
            address={loginAddress}
            name={accountName}
          />
        )}
      </Button>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        className={classNames(poppins.className, poppins.variable)}
        wrapClassName={classNames(poppins.className, poppins.variable)}
        footer={
          <Button
            className="h-10 px-6 mt-4 text-sm tracking-wide"
            onClick={() => setOpen(false)}
          >
            Confirm
          </Button>
        }
      >
        <AvailableWallets className="flex w-full justify-center items-center gap-3" />
        {!accounts.length && !loginAddress ? (
          <Alert
            message="Select a wallet"
            showIcon
            className="rounded-[4px] mt-4"
            type="info"
          />
        ) : (
          <Select
            className="w-full mt-6 h-10 rounded-[4px]"
            options={options}
            onChange={(address) => setLoginAddress(address)}
            value={loginAddress || accounts?.[0].address}
            placeholder="Select Address"
          />
        )}
      </Modal>
    </div>
  );
};
export default ConnectWallet;

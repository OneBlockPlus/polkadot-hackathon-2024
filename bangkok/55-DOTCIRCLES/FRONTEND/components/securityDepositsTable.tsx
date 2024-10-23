"use client";

import { useState, useEffect } from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";

import { Button } from "@nextui-org/button";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/table";
import { myAddress } from "@/app/lib/mock";
import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
} from "@polkadot/extension-dapp";

const columns = [
  {
    key: "avatar",
    label: "",
  },
  {
    key: "name",
    label: "NAME",
  },
  {
    key: "amount",
    label: "CURRENT SECURITY DEPOSIT",
  },
  {
    key: "showButton",
    label: "",
  },
];

export default function SecurityDepositsTable({
  rows,
  roscaId,
}: {
  rows: [
    {
      key: any;
      avatar: any;
      name: any;
      amount: any;
      showButton: any;
    }
  ];
  roscaId: any;
}) {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isApiReady, setIsApiReady] = useState(false);

  useEffect(() => {
    const initApi = async () => {
      try {
        // Initialize the provider to connect to the node
        const provider = new WsProvider(process.env.NEXT_PUBLIC_RPC);

        // Create the API and wait until ready
        const api = await ApiPromise.create({ provider });
        await api.isReady;

        // Update state
        setApi(api);
        setIsApiReady(true);
      } catch (error) {
        console.error("Failed to initialize API", error);
      }
    };

    initApi();

    return () => {
      if (api) {
        api.disconnect();
      }
    };
  }, []);

  const handleTopUp = async () => {
    if (!isApiReady) {
      console.log("API is not ready");
      return;
    }

    try {
      const extensions = await web3Enable("DOTCIRCLES");
      const acc = await web3FromAddress(myAddress);

      const tx = api!.tx.rosca.addToSecurityDeposit(roscaId, 100);

      const hash = await tx.signAndSend(myAddress, {
        signer: acc.signer,
        nonce: -1,
      });
    } catch (error) {
      console.error("Failed to submit extrinsic", error);
    }
  };

  const newRows = rows.map((row) => {
    if (row.hasOwnProperty("showButton")) {
      return {
        ...row,
        showButton: row.showButton ? (
          <Button
            onClick={handleTopUp}
            className={`bg-gradient-to-tr from-rose-500 to-purple-500 text-white shadow-lg`}
            radius="full"
          >
            Top Up
          </Button>
        ) : (
          ""
        ),
      };
    }
    return row;
  });

  return (
    <Table aria-label="Example table with dynamic content" isCompact>
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.key} align="start">
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={newRows}>
        {(item) => (
          <TableRow key={item.key}>
            {(columnKey) => (
              <TableCell>{getKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

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
    key: "showButton",
    label: "",
  },
];

export default function InvitedParticipantTable({
  rows,
  roscaId,
}: {
  rows: [
    {
      key: any;
      avatar: any;
      name: any;
      joined: any;
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

    // Cleanup when the component unmounts
    return () => {
      if (api) {
        api.disconnect();
      }
    };
  }, []);

  const handleLeave = async () => {
    if (!isApiReady) {
      console.log("API is not ready");
      return;
    }

    try {
      const extensions = await web3Enable("DOTCIRCLES");
      const acc = await web3FromAddress(myAddress);
      // Replace with your actual extrinsic submission logic
      const tx = api!.tx.rosca.leaveRosca(roscaId);

      const hash = await tx.signAndSend(myAddress, {
        signer: acc.signer,
        nonce: -1,
      });
    } catch (error) {
      console.error("Failed to submit extrinsic", error);
    }
  };

  const handleJoin = async () => {
    if (!isApiReady) {
      console.log("API is not ready");
      return;
    }

    try {
      const extensions = await web3Enable("DOTCIRCLES");
      const acc = await web3FromAddress(myAddress);
      const tx = api!.tx.rosca.joinRosca(roscaId, null);

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
        showButton:
          row.showButton == "leave" ? (
            <Button onClick={handleLeave}>Leave</Button>
          ) : (
            <Button onClick={handleJoin}>Join</Button>
          ),
      };
    }
    return row;
  });

  // return (
  //   <Button onClick={handleClick} disabled={!isApiReady}>
  //     Submit Extrinsic
  //   </Button>
  // );

  return (
    <Table aria-label="Example table with dynamic content" isCompact isStriped>
      <TableHeader columns={columns}>
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
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

"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/table";

const columns = [
  {
    key: "name",
    label: "NAME",
  },
  {
    key: "type",
    label: "TYPE",
  },
  {
    key: "number_of_participants",
    label: "MAX PARTICIPANTS",
  },
  {
    key: "min_participants",
    label: "MIN PARTICIPANTS",
  },
  {
    key: "contribution_amount",
    label: "CONTRIBUTION AMOUNT",
  },
  {
    key: "contribution_frequency",
    label: "CONTRIBUTION FREQUENCY",
  },
  {
    key: "start_by_date",
    label: "START DATE",
  },
  {
    key: "view",
    label: "",
  },
];

export default function RoscaDetailsTable({
  rows,
}: {
  rows: [
    {
      key: any;
      name: any;
      type: any;
      number_of_participants: any;
      contribution_amount: any;
      contribution_frequency: any;
      start_by_date: any;
      view: any;
      expired: any;
    }
  ];
}) {
  return (
    <Table aria-label="Example table with dynamic content">
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.key} align="center">
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={rows} emptyContent={"No invites so far..."}>
        {(item) => (
          <TableRow key={item.key} className={item.expired ? "opacity-25" : ""}>
            {(columnKey) => (
              <TableCell>{getKeyValue(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

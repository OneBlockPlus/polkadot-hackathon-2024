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
    key: "avatar",
    label: "",
  },
  {
    key: "name",
    label: "DEFAULTERS",
  },
  {
    key: "defaultCount",
    label: "DEFAULT COUNT",
  },
];

export default function DefaultersTable({
  rows,
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
}) {
  return (
    <Table aria-label="Example table with dynamic content" isCompact>
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.key} align="center">
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={rows}>
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

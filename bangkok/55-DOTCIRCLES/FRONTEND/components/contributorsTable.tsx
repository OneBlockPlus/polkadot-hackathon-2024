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

const columns: {
  key: string;
  label: string;
  align: "center" | "end" | "start" | undefined;
}[] = [
  {
    key: "avatar",
    label: "",
    align: "start",
  },

  {
    key: "name",
    label: "CONTRIBUTED",
    align: "start",
  },
];

export default function ContributorsTable({
  rows,
}: {
  rows: [
    {
      key: any;
      avatar: any;
      name: any;
    }
  ];
}) {
  return (
    <Table aria-label="Example table with dynamic content" isCompact>
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.key} align={column.align} maxWidth={5}>
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={rows} emptyContent={"No contributors so far..."}>
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

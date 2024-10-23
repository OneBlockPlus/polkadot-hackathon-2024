"use client";

import {IPay} from "@/libs/db/dao/pay/payDao";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@nextui-org/react";
import {useCallback} from "react";

type DataType = IPay;

const columns = [
    {name: "Id", uid: "id"},
    {name: "Receiver", uid: "receiver"},
    {name: "Payer", uid: "payer"},
    {name: "Amount", uid: "amount"},
    {name: "Create Date", uid: "create_date"},
];

interface ArticleTableProps {
    payList: IPay[],
}

export default function PayTable(props: ArticleTableProps) {
    const renderCell = useCallback((pay: DataType, columnKey: React.Key) => {
        const {_id, receiver, payer, amount, create_date} = pay;
        switch (columnKey) {
            case "id":
                return (
                    <p className="text-tiny text-white/60 uppercase font-bold">{_id.toString()}</p>
                );
            case "receiver":
                return (
                    <p className="text-tiny text-white/60 uppercase font-bold">{receiver}</p>
                );
            case "payer":
                return (
                    <p className="text-tiny text-white/60 uppercase font-bold">{payer}</p>
                );
            case "amount":
                return (
                    <p className="text-tiny text-white/60 uppercase font-bold">{amount}</p>
                );
            case "create_date":
                return (
                    <p className="text-tiny text-white/60 uppercase font-bold">{create_date.toString()}</p>
                );
            default:
                return <p className="text-tiny text-white/60 uppercase font-bold">Wrong columnKey</p>;
        }
    }, []);

    return (
        <Table aria-label="Example table with custom cells">
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody items={props.payList}>
                {(pay: DataType) => (
                    <TableRow key={pay._id.toString()}>
                        {(columnKey) => <TableCell>{renderCell(pay, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
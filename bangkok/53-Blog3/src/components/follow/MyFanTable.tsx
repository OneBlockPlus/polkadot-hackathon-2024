"use client";

import React, {useCallback, useContext, useEffect, useState} from "react";
import {FollowContext, IFollowProvider} from "@/providers/FollowProvider";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@nextui-org/react";

type DataType = {
    fans: string;
}

const columns = [
    {name: "Fans", uid: "fans"},
];

export default function MyFanTable() {
    const {fanList} = useContext<IFollowProvider>(FollowContext);
    const [data, setData] = useState<DataType[]>([])

    useEffect(() => {
        const tmpData: DataType[] = [];
        fanList.map((fan) => {
            tmpData.push({
                fans: fan,
            })
        });
        setData(tmpData)
    }, [fanList]);

    const renderCell = useCallback((fan: DataType, columnKey: React.Key) => {
        const {fans} = fan;
        switch (columnKey) {
            case "fans":
                return (
                    <p className="text-tiny text-white/60 uppercase font-bold">{fans}</p>
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
            <TableBody items={data}>
                {(fan: DataType) => (
                    <TableRow key={fan.fans}>
                        {(columnKey) => <TableCell>{renderCell(fan, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
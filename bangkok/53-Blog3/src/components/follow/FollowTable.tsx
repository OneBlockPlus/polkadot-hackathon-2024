"use client";

import {IFollow} from "@/libs/db/dao/follow/followDao";
import {useCallback} from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from "@nextui-org/react";

type DataType = IFollow;

const columns = [
    {name: "Id", uid: "id"},
    {name: "Author", uid: "author"},
    {name: "Fan", uid: "fan"},
    {name: "Create Date", uid: "create_date"},
];

interface ArticleTableProps {
    followList: IFollow[],
}

export default function FollowTable(props: ArticleTableProps) {
    const renderCell = useCallback((follow: DataType, columnKey: React.Key) => {
        const {_id, author, fans, create_date} = follow;
        switch (columnKey) {
            case "id":
                return (
                    <p className="text-tiny text-white/60 uppercase font-bold">{_id.toString()}</p>
                );
            case "author":
                return (
                    <p className="text-tiny text-white/60 uppercase font-bold">{author}</p>
                );
            case "fan":
                return (
                    <p className="text-tiny text-white/60 uppercase font-bold">{fans}</p>
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
            <TableBody items={props.followList}>
                {(follow: DataType) => (
                    <TableRow key={follow._id.toString()}>
                        {(columnKey) => <TableCell>{renderCell(follow, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
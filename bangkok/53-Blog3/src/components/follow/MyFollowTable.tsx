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
import FollowAuthorButton from "@/components/author/FollowAuthorButton";

type DataType = {
    follow: string;
}

const columns = [
    {name: "Author", uid: "author"},
    {name: "Follow", uid: "follow"},
];

// const columns: TableProps<DataType>['columns'] = [
//     {
//         title: 'Follow',
//         dataIndex: 'follow',
//         key: 'follow',
//     },
//     {
//         title: 'Pay',
//         dataIndex: 'pay',
//         key: 'pay',
//         render: (_, record) => {
//             const onClick = () => {
//                 const receiver = record.follow;
//                 const address = record.address;
//                 const success = record.success;
//                 const payInsertData: IPayInsert = {
//                     amount: 10,
//                     create_date: new Date(),
//                     payer: address,
//                     receiver: receiver
//                 }
//                 console.log("payInsertData:", payInsertData)
//                 fetch("/api/pay/", {
//                     method: "POST",
//                     body: JSON.stringify(payInsertData),
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                 })
//                     .then((response) => response.json())
//                     .then(async (data) => {
//                         console.log("payInsert success:", data.follow)
//                         success()
//                     });
//             }
//             return <Button onPress={onClick}>Pay</Button>
//         }
//     }
// ];

export default function MyFollowTable() {
    const {followList} = useContext<IFollowProvider>(FollowContext);
    const [data, setData] = useState<DataType[]>([])

    useEffect(() => {
        const tmpData: DataType[] = [];
        followList.map((follow) => {
            tmpData.push({
                follow: follow,
            })
        });
        setData(tmpData)
    }, [followList]);

    const renderCell = useCallback((follow: DataType, columnKey: React.Key) => {
        const author = follow.follow;
        switch (columnKey) {
            case "author":
                return (
                    <p className="text-tiny text-white/60 uppercase font-bold">{author}</p>
                );
            case "follow":
                return (
                    <FollowAuthorButton author={author}/>
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
                {(follow: DataType) => (
                    <TableRow key={follow.follow}>
                        {(columnKey) => <TableCell>{renderCell(follow, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
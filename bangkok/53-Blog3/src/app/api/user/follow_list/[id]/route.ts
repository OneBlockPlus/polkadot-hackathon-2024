import {
    connectDatabase,
} from '@/libs/db/dbUtils';
import { NextResponse } from "next/server";
import {followGetByFan} from "@/libs/db/dao/follow/followDao";

/* 获取某个用户的关注列表 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
    let client;

    try {
        client = await connectDatabase();
    } catch (error) {
        return NextResponse.json(
            { message: "Connecting to the database failed!" },
            {
                status: 500,
            }
        );
    }
    try {
        const follows = await followGetByFan(client, params.id);
        // console.log("follows:", follows)
        await client.close();
        return NextResponse.json(
            {
                fan:params.id,
                data: follows
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        await client.close();
        return NextResponse.json(
            { message: "Getting articles failed." },
            {
                status: 500,
            }
        );
    }
}
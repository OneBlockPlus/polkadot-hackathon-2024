import {
    connectDatabase,
} from '@/libs/db/dbUtils';
import {NextResponse} from "next/server";
import {followGetByAuthor} from "@/libs/db/dao/follow/followDao";

/* 获取某个author的粉丝列表 */
export async function GET(request: Request, {params}: { params: { id: string } }) {
    let client;

    try {
        client = await connectDatabase();
    } catch (error) {
        return NextResponse.json(
            {message: "Connecting to the database failed!"},
            {
                status: 500,
            }
        );
    }
    try {
        const follows = await followGetByAuthor(client, params.id);
        await client.close();
        return NextResponse.json(
            {
                id: params.id,
                data: follows
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        await client.close();
        return NextResponse.json(
            {message: "Getting articles failed."},
            {
                status: 500,
            }
        );
    }
}
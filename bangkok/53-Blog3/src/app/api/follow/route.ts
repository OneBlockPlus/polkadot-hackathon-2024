import {
    connectDatabase,
} from '@/libs/db/dbUtils';
import { NextRequest, NextResponse } from "next/server";
import {followInsert, IFollowInsert} from "@/libs/db/dao/follow/followInsertDao";
import {IFollow, followGetAll} from "@/libs/db/dao/follow/followDao";

/* 新增follow(关注)方法 */
export async function POST(request: NextRequest) {
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
    const tmp:IFollowInsert = await request.json();
    console.log("FollowInsert receive request:", tmp)
    const {
        author,
        fans,
        create_date,
    } = tmp;

    // TODO 参数校验

    // 封装传输的数据
    const insertFollow: IFollowInsert = {
        author: author,
        fans:fans,
        create_date:create_date,
    };

    let result;

    try {
        result = await followInsert(client, insertFollow);
        await client.close();
        const newFollow:IFollow= {
            _id: result.insertedId,
            author: insertFollow.author,
            fans: insertFollow.fans,
            create_date: insertFollow.create_date,
        };
        return NextResponse.json(
            { message: "Added article.", follow: newFollow },
            {
                status: 201,
            }
        );
    } catch (error) {
        await client.close();
        return NextResponse.json(
            { message: "Inserting article failed!" },
            {
                status: 500,
            }
        );
    }
}

/* 获取article方法 */
export async function GET() {
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
        const follows = await followGetAll(client);
        await client.close();
        return NextResponse.json(
            { follows: follows },
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
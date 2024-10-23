import {
    connectDatabase,
} from '@/libs/db/dbUtils';
import { NextRequest, NextResponse } from "next/server";
import {IUserInsert, userInsert} from "@/libs/db/dao/user/userInsertDAO";
import {IUser} from "@/libs/db/dao/user/userDao";

/* 新增user方法 */
export async function POST(request: NextRequest) {
    let client;

    try {
        client = await connectDatabase();
    } catch {
        return NextResponse.json(
            { message: "Connecting to the database failed!" },
            {
                status: 500,
            }
        );
    }
    const req:IUserInsert = await request.json();
    const {
        address,
        name,
        avatar_url,
        description,
        create_date,
        update_date,
    } = req;

    // 参数校验
    // if (
    //     !email.includes("@") ||
    //     !name ||
    //     name.trim() === "" ||
    //     !text ||
    //     text.trim() === ""
    // ) {
    //     client.close();
    //     return NextResponse.json(
    //         { message: "Invalid input." },
    //         {
    //             status: 422,
    //         }
    //     );
    // }

    // 封装传输的数据
    const insertUser: IUserInsert = {
        address,
        name,
        avatar_url,
        description,
        create_date,
        update_date,
    };

    let result;

    try {
        result = await userInsert(client, insertUser);
        await client.close();
        const newUser:IUser= {
            _id: result.insertedId,
            address:insertUser.address,
            name:insertUser.name,
            avatar_url:insertUser.avatar_url,
            description:insertUser.description,
            create_date: insertUser.create_date,
            update_date: insertUser.update_date

        };
        return NextResponse.json(
            { message: "Added article.", data: newUser },
            {
                status: 201,
            }
        );
    } catch  {
        await client.close();
        return NextResponse.json(
            { message: "Inserting article failed!" },
            {
                status: 500,
            }
        );
    }
}
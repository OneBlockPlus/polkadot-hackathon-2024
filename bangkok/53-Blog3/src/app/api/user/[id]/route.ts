import {
    connectDatabase,
} from '@/libs/db/dbUtils';
import {NextRequest, NextResponse} from "next/server";
import {IUserUpdate, userUpdateByAddress} from "@/libs/db/dao/user/userUpdateDAO";
import {userGetOneByAddress} from "@/libs/db/dao/user/userInsertDAO";

/* 获取某个user */
export async function GET(request: Request, {params}: { params: { id: string } }) {
    let client;

    try {
        client = await connectDatabase();
    } catch {
        return NextResponse.json(
            {message: "Connecting to the database failed!"},
            {
                status: 500,
            }
        );
    }
    try {
        const user = await userGetOneByAddress(client, params.id);
        await client.close();
        return NextResponse.json(
            {
                id: params.id,
                data: user
            },
            {
                status: 200,
            }
        );
    } catch {
        await client.close();
        return NextResponse.json(
            {message: "Getting user failed."},
            {
                status: 500,
            }
        );
    }
}

/* 更新user方法 */
export async function UPDATE(
    request: NextRequest
) {
    let client;

    try {
        client = await connectDatabase();
    } catch {
        return NextResponse.json(
            {message: "Connecting to the database failed!"},
            {
                status: 500,
            }
        );
    }
    const user: IUserUpdate = await request.json();
    const {
        _id,
        address,
        name,
        avatar_url,
        description,
        update_date,
    } = user;

    // todo 参数校验&鉴权
    // console.log("id:", id)
    // console.log("params.id:", params.id)
    // if(id != params.id) {
    //     await client.close();
    //     return NextResponse.json(
    //         { message: "Invalid input." },
    //         {
    //             status: 422,
    //         }
    //     );
    // }

    // 封装传输的数据
    const updateUser: IUserUpdate = {
        _id,
        address,
        name,
        avatar_url,
        description,
        update_date,
    };

    let result;

    try {
        result = await userUpdateByAddress(client, updateUser);
        await client.close();
        return NextResponse.json(
            {
                message: "Updated user.",
                update_user: updateUser,
                update_result: result,
            },
            {
                status: 201,
            }
        );
    } catch {
        await client.close();
        return NextResponse.json(
            {message: "Inserting article failed!"},
            {
                status: 500,
            }
        );
    }
}
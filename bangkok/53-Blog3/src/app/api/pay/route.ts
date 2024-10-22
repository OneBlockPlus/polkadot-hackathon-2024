import {
    connectDatabase,
} from '@/libs/db/dbUtils';
import { NextRequest, NextResponse } from "next/server";
import {IPayInsert, payInsert} from "@/libs/db/dao/pay/payInsertDao";
import {IPay, payGetAll} from "@/libs/db/dao/pay/payDao";

export interface IPayPostRequest {
    receiver:string,    // 被支付地址
    payer:string,    // 粉丝地址
    amount:bigint,  // 支付金额
    create_date: Date,
}

/* 新增follow(关注)方法 */
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
    const tmp:IPayPostRequest = await request.json();
    const {
        receiver,
        payer,
        amount,
        create_date,
    } = tmp;

    // TODO 参数校验

    // 封装传输的数据
    const payInsertData: IPayInsert = {
        payer: payer,
        receiver: receiver,
        amount: amount,
        create_date: create_date,
    };

    try {
        const result = await payInsert(client, payInsertData);
        await client.close();
        const newPay:IPay= {
            _id: result.insertedId,
            receiver: payInsertData.receiver,
            payer: payInsertData.payer,
            amount: payInsertData.amount,
            create_date: payInsertData.create_date
        };
        return NextResponse.json(
            { message: "Added pay.", data: newPay },
            {
                status: 201,
            }
        );
    } catch {
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
    } catch {
        return NextResponse.json(
            { message: "Connecting to the database failed!" },
            {
                status: 500,
            }
        );
    }
    try {
        const pays = await payGetAll(client);
        await client.close();
        return NextResponse.json(
            { data: pays },
            {
                status: 200,
            }
        );
    } catch {
        await client.close();
        return NextResponse.json(
            { message: "Getting articles failed." },
            {
                status: 500,
            }
        );
    }
}
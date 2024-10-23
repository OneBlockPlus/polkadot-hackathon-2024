import {articleGetOneById} from "@/libs/db/dao/article/articleDAO";
import {connectDatabase} from "@/libs/db/dbUtils";
import {NextResponse} from "next/server";
import {verifyJwtToken} from "@/libs/auth";

export interface IRequestGet {
    jwtToken:string, // TODO
}

/* 获取article方法 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const articleId = params.id

    // console.log("/api/articles/" + articleId);

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

    // 鉴权&&参数校验
    const req:IRequestGet = await request.json();
    const {jwtToken} = req;
    const payload = await verifyJwtToken(jwtToken);
    console.log("payload:", payload);

    try {
        const article = await articleGetOneById(client, articleId);
        await client.close();
        return NextResponse.json(
            { article: article },
            {
                status: 200,
            }
        );
    } catch {
        await client.close();
        return NextResponse.json(
            {
                message: "Getting articles failed.",
            },
            {
                status: 500,
            }
        );
    }
}
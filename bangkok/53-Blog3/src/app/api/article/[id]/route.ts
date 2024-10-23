import {articleGetOneById} from "@/libs/db/dao/article/articleDAO";
import {connectDatabase} from "@/libs/db/dbUtils";
import {NextRequest, NextResponse} from "next/server";
import {articleUpdate, IArticleUpdate} from "@/libs/db/dao/article/articleUpdateDAO";

/* 更新article方法 */
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
    const article: IArticleUpdate = await request.json();
    const {
        id,
        title,
        abstract,
        cover_url,
        content,
        update_date
    } = article;

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
    const updateArticle: IArticleUpdate = {
        id: id,
        title: title,
        abstract:abstract,
        cover_url:cover_url,
        content: content,
        update_date: update_date,
    };

    let result;

    try {
        result = await articleUpdate(client, updateArticle);
        await client.close();
        return NextResponse.json(
            {
                message: "Updated article.",
                update_article: updateArticle,
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

/* 获取article方法 */
export async function GET(request: NextRequest, {params}: { params: { id: string } }) {
    const articleId = params.id
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

    // 鉴权&&参数校验
    // console.log("request:", request)
    // console.log("cookie:", request.cookies)

    // const req:IRequestGet = await request.json();
    // const {jwtToken} = req;
    // const payload = await verifyJwtToken(jwtToken);
    // console.log("payload:", payload);

    try {
        const article = await articleGetOneById(client, articleId);
        await client.close();
        return NextResponse.json(
            {article: article},
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
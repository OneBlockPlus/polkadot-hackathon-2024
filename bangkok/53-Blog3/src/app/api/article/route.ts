import {articleBriefGetAll, IArticle} from '@/libs/db/dao/article/articleDAO';
import { articleInsert, IArticleInsert } from '@/libs/db/dao/article/articleInsertDAO';
import {
    connectDatabase,
} from '@/libs/db/dbUtils';
import { NextRequest, NextResponse } from "next/server";

/* 新增article方法 */
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
    const tmp:IArticleInsert = await request.json();
    console.log("tmp:", tmp)
    const {
        author,
        title,
        abstract,
        cover_url,
        content,
        is_request_pay,
        create_date,
        update_date,
    } = tmp;

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
    const insertArticle: IArticleInsert = {
        author: author,
        title: title,
        abstract: abstract,
        cover_url: cover_url,
        content: content,
        is_request_pay: is_request_pay,
        create_date:create_date,
        update_date:update_date,
    };

    let result;

    try {
        result = await articleInsert(client, insertArticle);
        await client.close();
        const newArticle:IArticle= {
            _id: result.insertedId,
            author: insertArticle.author,
            abstract: insertArticle.abstract,
            cover_url: insertArticle.cover_url,
            title: insertArticle.title,
            content: insertArticle.content,
            is_request_pay: insertArticle.is_request_pay,
            create_date: insertArticle.create_date,
            update_date: insertArticle.update_date

        };
        return NextResponse.json(
            { message: "Added article.", article: newArticle },
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

/* 获取article方法 */
export async function GET(request: NextRequest) {
    let client;

    // console.log("cookies:", request.cookies)
    const jwtToken = request.cookies.get("jwtToken")
    // console.log("jwtToken:", jwtToken)

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
        const articleList = await articleBriefGetAll(client);
        // console.log("api get brief articleList:", articleList)
        await client.close();
        return NextResponse.json(
            { articles: articleList },
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
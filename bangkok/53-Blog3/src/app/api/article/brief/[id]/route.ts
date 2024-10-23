import {articleBriefGetOneById} from "@/libs/db/dao/article/articleDAO";
import {connectDatabase} from "@/libs/db/dbUtils";
import {NextResponse} from "next/server";

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

    try {
        const article = await articleBriefGetOneById(client, articleId);
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
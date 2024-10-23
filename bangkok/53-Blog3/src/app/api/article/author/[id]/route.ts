import {
    connectDatabase,
} from '@/libs/db/dbUtils';
import { NextResponse } from "next/server";
import {articleGetByAuthor} from "@/libs/db/dao/article/articleDAO";

/* 获取article方法 */
export async function GET(request: Request, { params }: { params: { author: string } }) {
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
        const articles = await articleGetByAuthor(client, params.author);
        await client.close();
        return NextResponse.json(
            {
                author: params.author,
                articles: articles
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
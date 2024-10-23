import {
    connectDatabase,
    getAllDocuments,
    insertDocument,
} from '@/libs/db/dbUtils';
import { NextRequest, NextResponse } from "next/server";

/* 新增Comment方法 */
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
    const tmp = await request.json()
    console.log(tmp)
    const { email, name, text, articleId } = tmp;

    if (
        !email.includes("@") ||
        !name ||
        name.trim() === "" ||
        !text ||
        text.trim() === ""
    ) {
        client.close();
        return NextResponse.json(
            { message: "Invalid input." },
            {
                status: 422,
            }
        );
    }

    const newComment: any = {
        email,
        name,
        text,
        articleId,
    };

    let result;

    try {
        result = await insertDocument(client, "comments", newComment);
        newComment._id = result.insertedId;
        return NextResponse.json(
            { message: "Added comment.", comment: newComment },
            {
                status: 201,
            }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Inserting comment failed!" },
            {
                status: 500,
            }
        );
    }
}

/* 获取Comments方法 */
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
        const documents = await getAllDocuments(client, "comments", { _id: -1 });
        return NextResponse.json(
            { comments: documents },
            {
                status: 200,
            }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Getting comments failed." },
            {
                status: 500,
            }
        );
    }
}
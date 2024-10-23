import {MongoClient, ObjectId} from "mongodb";

const collection_name = "article";

export interface IArticleUpdate {
    id: string,
    title: string,
    abstract: string,
    cover_url: string,
    content: string,
    update_date: Date,
}

export async function articleUpdate(
    client: MongoClient,
    article: IArticleUpdate,
) {
    const db = client.db('blog3');
    const result = await db.collection(collection_name).updateOne(
        { _id: new ObjectId(article.id) },
        {
            $set:{
                article_name:article.title,
                article_content:article.content,
                update_date:article.update_date,
            }
        }
    );
    return result;
}


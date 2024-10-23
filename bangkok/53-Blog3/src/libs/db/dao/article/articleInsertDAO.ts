import {MongoClient} from "mongodb";
import {insertDocument} from "../../dbUtils";

const collection_name = "article";

export interface IArticleInsert {
    author: string, // 钱包地址
    title: string,
    abstract: string,
    cover_url: string,
    content: string,
    is_request_pay: boolean, // 是否要求付费后才能阅览
    create_date: Date,
    update_date: Date,
}

export async function articleInsert(
    client: MongoClient,
    article: IArticleInsert
) {
    return await insertDocument(client, collection_name, article);
}
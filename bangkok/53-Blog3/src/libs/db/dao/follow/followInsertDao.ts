import {MongoClient} from "mongodb";
import {insertDocument} from "../../dbUtils";

const collection_name = "follow";

export interface IFollowInsert {
    author:string,    // 被关注者地址
    fans:string,    // 粉丝地址
    create_date: Date,
}

export async function followInsert(
    client: MongoClient,
    follow: IFollowInsert
) {
    return await insertDocument(client, collection_name, follow);
}
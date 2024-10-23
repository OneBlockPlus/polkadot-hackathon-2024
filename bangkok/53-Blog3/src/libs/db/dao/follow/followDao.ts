import {Filter, MongoClient, ObjectId} from "mongodb";
import {getAllDocuments, getDocumentByFilter} from "../../dbUtils";

const collection_name = "follow";

export interface IFollow {
    _id: ObjectId,
    author:string,    // 被关注者地址
    fans:string,    // 粉丝地址
    create_date: Date,
}

export async function followGetAll(
    client: MongoClient
) {
    return await getAllDocuments(client, collection_name, {_id: -1});
}

// 查询某个作者的所有粉丝
export async function followGetByAuthor(
    client: MongoClient,
    author: string,
) {
    const filter:Filter<IFollow> = {author:author};
    return await getDocumentByFilter(client, collection_name, filter, {_id: -1});
}

// 查询某个作者的所有粉丝
export async function followGetByFan(
    client: MongoClient,
    fan: string,
) {
    const filter:Filter<IFollow> = {fans:fan};
    return await getDocumentByFilter(client, collection_name, filter, {_id: -1})
}
// todo 取关功能
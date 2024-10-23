import {Filter, MongoClient, ObjectId} from "mongodb";
import {getAllDocuments, getDocumentByFilter, getDocumentById, getOneDocumentById} from "../../dbUtils";

const collection_name = "article";

export interface IArticle {
    _id: ObjectId,
    author: string, // 钱包地址
    title: string,
    abstract: string, // 摘要
    cover_url: string, // 封面图片
    content: string,
    is_request_pay: boolean, // 是否要求付费后才能阅览
    create_date: Date,
    update_date: Date,
}

export async function articleGetAll(
    client: MongoClient
) {
    return await getAllDocuments(client, collection_name, {_id: -1});
}

export async function articleBriefGetAll(
    client: MongoClient
) {
    const articleList = await getAllDocuments(client, collection_name, {_id: -1});
    if (articleList) {
        return articleList.map((article: IArticle) => {
            return getBriefArticle(article)
        })
    } else {
        return []
    }
}

export async function articleGetById(
    client: MongoClient,
    id: string
) {
    return await getDocumentById(client, collection_name, id, {_id: -1});
}

export async function articleGetByAuthor(
    client: MongoClient,
    author: string
) {
    const filter: Filter<IArticle> = {author: author};
    return await getDocumentByFilter(client, collection_name, filter, {_id: -1});
}

export async function articleGetOneById(
    client: MongoClient,
    id: string
) {
    return await getOneDocumentById(client, collection_name, id);
}

export async function articleBriefGetOneById(
    client: MongoClient,
    id: string,
) {
    const articleList = await articleGetOneById(client, id);
    if (articleList) {
        return articleList.map((article: IArticle) => {
            return getBriefArticle(article)
        })
    } else {
        return []
    }
}

function getBriefArticle(article: IArticle) {
    article.content = "";
    return article
}
import {Filter, MongoClient, ObjectId, Sort} from "mongodb";

// 连接MongoDB数据库
export async function connectDatabase() {
    // 需要替换为自己的用户名和密码
    // const client = await MongoClient.connect("mongodb://username:password@your ip:27017");
    const client = await MongoClient.connect("mongodb://127.0.0.1:27017");

    return client;
}

export async function connectDbBlog3() {
    const client = await connectDatabase();
    return client.db('blog3');
}


// 插入数据到名为comments的collection
export async function insertDocument(
    client: MongoClient,
    collection: string,
    document: any
) {
    const db = client.db('blog3');

    const result = await db.collection(collection).insertOne(document);

    return result;
}

// 查询名为comments的collection中所有数据
export async function getAllDocuments(
    client: MongoClient,
    collection: string,
    sort: Sort
) {
    const db = client.db('blog3');

    return await db.collection(collection).find().sort(sort).toArray();
}

// 查询名为comments的collection中所有数据
export async function getDocumentById(
    client: MongoClient,
    collection: string,
    id: string,
    sort: Sort
) {
    const db = client.db('blog3');

    return await db.collection(collection).find({_id: new ObjectId(id)}).sort(sort).toArray();
}

export async function getOneDocumentById(
    client: MongoClient,
    collection: string,
    id: string
) {
    const db = client.db('blog3');

    return await db.collection(collection).findOne({_id: new ObjectId(id)});
}

// 查询名为comments的collection中所有数据
export async function getDocumentByFilter(
    client: MongoClient,
    collection: string,
    filter: Filter<any>,
    sort: Sort
) {
    const db = client.db('blog3');

    return await db.collection(collection).find(filter).sort(sort).toArray();
}

// 查询名为comments的collection中所有数据
export async function getOneDocumentByFilter(
    client: MongoClient,
    collection: string,
    filter: Filter<any>,
) {
    const db = client.db('blog3');

    return await db.collection(collection).findOne(filter);
}
import {Filter, MongoClient, ObjectId} from "mongodb";
import {getAllDocuments, getDocumentByFilter} from "../../dbUtils";

const collection_name = "pay";

export interface IPay {
    _id: ObjectId,
    receiver:string,    // 被支付地址
    payer:string,    // 粉丝地址
    amount:bigint,  // 支付金额
    create_date: Date,
}

export async function payGetAll(
    client: MongoClient
) {
    return await getAllDocuments(client, collection_name, {_id: -1});
}

// 查询接受者的收款列表
export async function payGetByReceiver(
    client: MongoClient,
    receiver: string,
) {
    const filter:Filter<IPay> = {receiver:receiver};
    return await getDocumentByFilter(client, collection_name, filter, {_id: -1});
}

// 查询支付者的支付列表
export async function payGetByPayer(
    client: MongoClient,
    payer: string,
) {
    const filter:Filter<IPay> = {payer:payer};
    return await getDocumentByFilter(client, collection_name, filter, {_id: -1})
}
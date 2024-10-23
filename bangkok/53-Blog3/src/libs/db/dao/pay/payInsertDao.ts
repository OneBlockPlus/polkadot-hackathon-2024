import {MongoClient} from "mongodb";
import {insertDocument} from "../../dbUtils";

const collection_name = "pay";

export interface IPayInsert {
    receiver:string,    // 被支付地址
    payer:string,    // 粉丝地址
    amount:number,  // 支付金额
    create_date: Date,
}

export async function payInsert(
    client: MongoClient,
    pay: IPayInsert
) {
    return await insertDocument(client, collection_name, pay);
}
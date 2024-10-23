import {MongoClient} from "mongodb";
import {getOneDocumentByFilter, insertDocument} from "../../dbUtils";

const collection_name = "user";

export interface IUserInsert {
    address: string,
    name: string,
    avatar_url: string,
    description: string,
    create_date: Date,
    update_date: Date,
}

export async function userInsert(
    client: MongoClient,
    article: IUserInsert
) {
    return await insertDocument(client, collection_name, article);
}

export async function userGetOneByAddress(
    client: MongoClient,
    address: string
) {
    const filter: Filter<IUser> = {address: address};
    return await getOneDocumentByFilter(client, collection_name, filter)
}

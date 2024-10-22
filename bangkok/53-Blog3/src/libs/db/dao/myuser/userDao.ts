import {Filter, MongoClient, ObjectId} from "mongodb";
import {
    getAllDocuments,
    getDocumentById,
    getOneDocumentByFilter,
} from "../../dbUtils";

const collection_name = "user";

export interface IUser {
    _id: ObjectId,
    address: string,
    name: string,
    avatar_url: string,
    description: string,
    create_date: Date,
    update_date: Date,
}

export const default_avatar_url = "https://i.pravatar.cc/150?u=a04258114e29026702d";


export async function userGetAll(
    client: MongoClient
) {
    return await getAllDocuments(client, collection_name, {_id: -1});
}

export async function userGetById(
    client: MongoClient,
    id: string
) {
    return await getDocumentById(client, collection_name, id, {_id: -1});
}

export async function userGetOneByAddress(
    client: MongoClient,
    address: string
) {
    const filter: Filter<IUser> = {address: address};
    return await getOneDocumentByFilter(client, collection_name, filter)
}
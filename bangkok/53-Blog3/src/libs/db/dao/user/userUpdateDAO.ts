import {MongoClient, ObjectId} from "mongodb";

const collection_name = "user";

export interface IUserUpdate {
    _id: string,
    address: string,
    name: string,
    avatar_url: string,
    description: string,
    update_date: Date,
}

export async function userUpdateById(
    client: MongoClient,
    user: IUserUpdate,
) {
    const db = client.db('blog3');
    return await db.collection(collection_name).updateOne(
        {_id: new ObjectId(user._id)},
        {
            $set: {
                name: user.name,
                avatar_url: user.avatar_url,
                description: user.description,
                update_date: user.update_date,
            }
        }
    );
}

export async function userUpdateByAddress(
    client: MongoClient,
    user: IUserUpdate,
) {
    const db = client.db('blog3');
    return await db.collection(collection_name).updateOne(
        {address: user.address},
        {
            $set: {
                name: user.name,
                avatar_url: user.avatar_url,
                description: user.description,
                update_date: user.update_date,
            }
        }
    );
}
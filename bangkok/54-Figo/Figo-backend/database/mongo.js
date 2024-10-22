import mongoose from 'mongoose';

import dotenv from 'dotenv';
dotenv.config();

export let database;

export const mongoConnect = async (callback) => {
    try {
        database = await mongoose.connect(process.env.MONGO_DB_CLUSTER);
        callback();
    } catch (error) {
        console.log(`Database error occured ${error}`);
    }
};

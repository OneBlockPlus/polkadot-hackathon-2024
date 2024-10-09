import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

export const connect = async () => {
    const conState = mongoose.connection.readyState;

    // To avoid re-opening the connection, check the connection state
    if (conState === 1) {
        console.log("Already connected to mongodb.");
        return;
    }

    if (conState === 2) {
        console.log("Connecting to mongodb...");
        return;
    }

    try {
        // We know the uri exists so override typescript's warning.
        await mongoose.connect(MONGODB_URI!, {
            dbName: "relay-api",
            bufferCommands: false,
        });
        console.log("MongoDB connected.");
    } catch(err: any) {
        console.log("Error connecting to mongodb in: ", err.message);
        throw new Error("Error connecting to mongodb: ", err);
    }
}
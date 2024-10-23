import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const URI = process.env.MONGODB_URI || "";

export const connect = async () => {
  const connectionState = mongoose.connection.readyState;

  if (connectionState === 1) {
    console.log("Already connected.");
    return;
  }

  if (connectionState === 2) {
    console.log("Connecting...");
    return;
  }

  try {
    mongoose.connect(URI, {
      dbName: "relay-users",
      bufferCommands: false,
    });
  } catch (err) {
    throw new Error(`Error connecting to database: ${err.message}`);
  }
};

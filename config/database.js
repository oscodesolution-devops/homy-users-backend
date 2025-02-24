import mongoose from "mongoose";
import { logger } from "../server.js";

export const connectDB = async () => {
    const connect = await mongoose.connect(`${process.env.MONGO_URI}`);
    logger.info(
      `MongoDB connected => ` +
        `Host: ${connect.connection.host}:${connect.connection.port}, ` +
        `Database: ${connect.connection.name} `
    );
};
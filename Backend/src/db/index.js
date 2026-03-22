import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.DATABASE_URL}/${DB_NAME}`
        );
        console.log(`Connection Successful with Database DB host:${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Issues in DataBase Connection", error);
        process.exit(1);
    }
};

export default connectDB

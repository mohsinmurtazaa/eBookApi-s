import mongoose from "mongoose";
import { config } from "./config";

const connectDb = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("db connected");
    });
    mongoose.connection.on("error", (err) => {
      console.log("error in connection", err);
    });
    await mongoose.connect(config.dbUrl as string);
  } catch (error) {
    console.error("failed to connect to db", error);
    process.exit(1);
  }
};
export default connectDb;

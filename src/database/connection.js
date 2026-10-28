
import mongoose from "mongoose";
import { connectRedis } from "./redis.connection.js";

export async function main() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Data Base Connected");

    await connectRedis();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

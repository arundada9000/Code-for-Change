import mongoose from "mongoose";
import { ENV } from "../shared/configs/env.js";

const databaseLoader = async (): Promise<void> => {
  try {
    const connection = await mongoose.connect(ENV.MONGO_URI);
    console.log(`✅ Database connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

export default databaseLoader;

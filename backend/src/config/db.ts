import mongoose from "mongoose";
import logger from "../utils/logger.js";

const dbConnect = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Database connection established");
  } catch (err) {
    logger.error(
      { error: (err as Error).message },
      "Database connection failed"
    );
    process.exit(1);
  }
};

export default dbConnect;

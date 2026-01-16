import mongoose from "mongoose";
import logger from "../utils/logger.js";
import config from "./index.js";

class Database {
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    try {
      await mongoose.connect(config.MONGO_URI, {
        maxPoolSize: 10, // Maximum number of connections in the connection pool
        minPoolSize: 2, // Minimum number of connections in the connection pool
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      });

      this.isConnected = true;
      logger.info("Database connection established with connection pooling");

      // Handle connection events
      mongoose.connection.on("connected", () => {
        logger.info("MongoDB connected");
      });

      mongoose.connection.on("error", (err) => {
        logger.error({ error: err.message }, "MongoDB connection error");
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
        this.isConnected = false;
      });
    } catch (err) {
      logger.error(
        { error: (err as Error).message },
        "Database connection failed"
      );
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.connection.close();
      this.isConnected = false;
      logger.info("Database connection closed");
    } catch (err) {
      logger.error(
        { error: (err as Error).message },
        "Error closing database connection"
      );
      throw err;
    }
  }

  get isDbConnected(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  get connection() {
    return mongoose.connection;
  }
}

const database = new Database();

export default database;

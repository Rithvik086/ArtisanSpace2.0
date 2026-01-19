import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import type { Request, Response, NextFunction } from "express";
import dbConnect from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import logger from "./utils/logger.js";
import config from "./config/index.js";
import managerRoutes from "./routes/manager.routes.js";
import productRoutes from "./routes/product.routes.js";
import paymentRoutes from "./routes/payment.route.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Allow skipping DB connection for local/demo use by setting SKIP_DB=true in .env
if (config.SKIP_DB !== "true") {
  await dbConnect.connect();
} else {
  logger.info("SKIP_DB=true — skipping database connection for demo mode");
}

const PORT = config.PORT;
const app = express();

app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Create main API router for /api/v1/
const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/products", productRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/delivery", deliveryRoutes);
apiRouter.use("/manager", managerRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use("/", userRoutes);


app.use("/api/v1", apiRouter);

if (config.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  app.get("/*splat", (_req: Request, res: Response) => {
    const pathFile = path.join(
      __dirname,
      "../../frontend",
      "dist",
      "index.html"
    );
    res.sendFile(pathFile);
  });
}

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).send({
    success: false,
    message: "Internal Server Error",
  });
});

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server is running");
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(
    { signal },
    "Received shutdown signal, starting graceful shutdown"
  );

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await dbConnect.disconnect();
      logger.info("Database connection closed");
    } catch (err) {
      logger.error(
        { error: (err as Error).message },
        "Error closing database connection"
      );
    }

    logger.info("Graceful shutdown completed");
    process.exit(0);
  });

  // Force close server after 10 seconds
  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

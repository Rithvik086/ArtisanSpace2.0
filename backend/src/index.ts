import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import fs from "fs";
import type { Request, Response, NextFunction } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dbConnect from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import usersRoutes from "./routes/users.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import logger from "./utils/logger.js";
import config from "./config/index.js";
import managerRoutes from "./routes/manager.routes.js";
import productRoutes from "./routes/product.routes.js";
import paymentRoutes from "./routes/payment.route.js";
import b2bRoutes from "./routes/b2b.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import workshopRoutes from "./routes/workshop.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import customRequestRoutes from "./routes/customRequest.routes.js";
import dataRoutes from "./routes/data.routes.js";
import { storeGraphQLHandler } from "./graphql/handler.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import helmet from "helmet";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ArtisanSpace API",
      version: "1.0.0",
      description:
        "API documentation for ArtisanSpace e-commerce platform with role-based access control",
    },
    tags: [
      {
        name: "Artisan",
        description:
          "Endpoints specifically for Artisans (e.g., workshops, products, custom requests)",
      },
    ],
    servers: [
      {
        url: `http://localhost:${config.PORT}/api/v1`,
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for morgan logs
const logStream = fs.createWriteStream(path.join(logsDir, "logs.txt"), {
  flags: "a",
});

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
  }),
);

// app.use(helmet());

// Morgan middleware for HTTP request logging
// Combined format to file
app.use(morgan("combined", { stream: logStream }));

// Dev format to console (always on, for visibility)
app.use(
  morgan("dev", {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  }),
);

app.use(cookieParser());
app.use(express.json());

app.all("/api/v1/graphql", storeGraphQLHandler);

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.debug(
    {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
    },
    "Incoming request",
  );
  next();
});

// Create main API router for /api/v1/
const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/products", productRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/delivery", deliveryRoutes);
apiRouter.use("/manager", managerRoutes);
apiRouter.use("/payments", paymentRoutes);
apiRouter.use("/b2b", b2bRoutes);
apiRouter.use("/users", usersRoutes);
apiRouter.use("/cart", cartRoutes);
apiRouter.use("/orders", orderRoutes);
apiRouter.use("/workshops", workshopRoutes);
apiRouter.use("/tickets", ticketRoutes);
apiRouter.use("/custom-requests", customRequestRoutes);
apiRouter.use("/data", dataRoutes);
apiRouter.use("/", userRoutes);

app.use("/api/v1", apiRouter);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

if (config.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  app.get("/*splat", (_req: Request, res: Response) => {
    const pathFile = path.join(
      __dirname,
      "../../frontend",
      "dist",
      "index.html",
    );
    res.sendFile(pathFile);
  });
}

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error(
    {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    },
    "Unhandled error",
  );
  res.status(500).send({
    success: false,
    message: "Internal Server Error",
  });
});

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server is running");
  logger.info(
    {
      nodeEnv: config.NODE_ENV,
      corsOrigin: config.CORS_ORIGIN,
      skipDb: config.SKIP_DB || false,
    },
    "Server configuration",
  );
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(
    { signal },
    "Received shutdown signal, starting graceful shutdown",
  );

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await dbConnect.disconnect();
      logger.info("Database connection closed");
    } catch (err) {
      logger.error(
        { error: (err as Error).message },
        "Error closing database connection",
      );
    }

    logger.info("Graceful shutdown completed");
    process.exit(0);
  });

  // Force close server after 10 seconds
  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

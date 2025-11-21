import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import type { Request, Response, NextFunction } from "express";
import dbConnect from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Allow skipping DB connection for local/demo use by setting SKIP_DB=true in .env
if (process.env.SKIP_DB !== "true") {
  await dbConnect();
} else {
  console.log("SKIP_DB=true — skipping database connection for demo mode");
}

const PORT = process.env.PORT || 3000;
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Create main API router for /api/v1/
const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/", userRoutes);

app.use("/api/v1", apiRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  app.get("/*splat", (req: Request, res: Response) => {
    const pathFile = path.join(
      __dirname,
      "../../frontend",
      "dist",
      "index.html"
    );
    res.sendFile(pathFile);
  });
}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).send({
    success: false,
    message: "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import type { Request, Response, NextFunction } from "express";
import dbConnect from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";

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

app.get("/", (_req: Request, res: Response) => {
  res.send("Health Check OK");
});

app.use("/api/v1/auth/", authRoutes);
app.use("/api/v1/", userRoutes);
// Admin dashboard endpoints used by frontend (keeps paths simple at /api/...)
app.use("/api", adminRoutes);
import settingsRoutes from "./routes/settings.routes.js";
app.use("/api", settingsRoutes);

app.all("/*splat", (req: Request, res: Response) => {
  res.status(404).send({
    success: false,
    message: "Endpoint not found",
  });
});

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

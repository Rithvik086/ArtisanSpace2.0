import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import type { Request, Response, NextFunction } from "express";
import dbConnect from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();
await dbConnect();

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

app.use("/api/v1/", authRoutes);
app.use("/api/v1/", userRoutes);

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

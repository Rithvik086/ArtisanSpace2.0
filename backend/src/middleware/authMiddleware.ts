import jwt from "jsonwebtoken";
import { userExists } from "../services/userServices.js";
import type { Request, Response, NextFunction } from "express";
import config from "../config/index.js";
import logger from "../utils/logger.js";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: string;
        iat: number;
        exp: number;
      };
    }
  }
}

export const verifytoken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const cookieToken = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : undefined;
  const token = cookieToken || bearerToken;

  if (!token) {
    logger.debug("Authentication failed: No token provided");
    return res.status(401).json({ message: "Access denied. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      id: string;
      role: string;
      iat: number;
      exp: number;
    };
    req.user = decoded;
    if (await userExists(req.user.id)) {
      next();
    } else {
      logger.warn({ userId: decoded.id }, "User not found in database");
      res.clearCookie("token");
      return res
        .status(401)
        .json({ message: "User not found. Please sign up." });
    }
  } catch (err) {
    logger.debug(
      { error: (err as Error).message },
      "Token verification failed",
    );
    if (cookieToken) {
      res.clearCookie("token");
    }
    return res.status(401).json({ message: "Invalid token. Please log in." });
  }
};

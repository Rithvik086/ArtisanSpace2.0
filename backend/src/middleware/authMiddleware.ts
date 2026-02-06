import jwt from "jsonwebtoken";
import { userExists } from "../services/userServices.js";
import type { Request, Response, NextFunction } from "express";

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
  next: NextFunction
) => {
  let token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Access denied. Please log in." });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      role: string;
      iat: number;
      exp: number;
    };
    req.user = decoded;
    if (await userExists(req.user.id)) {
      next();
    } else {
      res.clearCookie("token");
      return res
        .status(401)
        .json({ message: "User not found. Please sign up." });
    }
  } catch (err) {
    res.clearCookie("token");
    return res.status(401).json({ message: "Invalid token. Please log in." });
  }
};

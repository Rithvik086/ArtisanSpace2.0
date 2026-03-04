import type { NextFunction, Request, Response } from "express";
import logger from "../utils/logger.js";

const authorizerole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        { userId: req.user.id, role: req.user.role, allowedRoles },
        "Access denied: Insufficient permissions",
      );
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Access is denied." });
    }
    logger.debug(
      { userId: req.user.id, role: req.user.role },
      "Role authorization passed",
    );
    next();
  };
};

export default authorizerole;

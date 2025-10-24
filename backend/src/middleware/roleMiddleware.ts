import type { NextFunction, Request, Response } from "express";

const authorizerole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Access is denied." });
    }
    next();
  };
};

export default authorizerole;

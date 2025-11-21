import type { Request, Response } from "express";
import { getUsersListService } from "../services/userServices.js";

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getUsersListService();
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export default {
  getUsers,
};

import type { Request, Response } from "express";
import { getUsersListService, getUserById } from "../services/userServices.js";

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getUsersListService();
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await getUserById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // Return user data in the format expected by frontend
    res.json({
      profile: {
        name: user.name,
        username: user.username,
        email: user.email,
        mobile: user.mobile_no,
      },
      addresses: [
        {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zip: user.address?.zip || "",
        },
        // For work, since model has only one address, return empty
        {
          street: "",
          city: "",
          state: "",
          zip: "",
        },
      ],
      notifications: {
        email: true, // Default, since not in model
        sms: false,
        push: true,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export default {
  getUsers,
  getUserSettings,
};

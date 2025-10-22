import type { Request, Response } from "express";
import cloudinary from "../config/cloudinary.js";
import { addRequest } from "../services/customRequestService.js";

export const reqCustomOrder = async (req: Request, res: Response) => {
  try {
    const { title, type, description, budget, requiredBy } = req.body;
    if (!title || !type || !description || !budget || !requiredBy) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled!",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    const result = await cloudinary.uploader.upload(req.file.path);
    const newrequest = await addRequest(
      req.user.id,
      title,
      type,
      result.secure_url,
      description,
      budget,
      requiredBy
    );
    res.json({
      success: true,
      message: "Custom order submitted successfully!",
      request: newrequest,
    });
  } catch (error) {
    throw new Error(
      "Error processing custom order request: " + (error as Error).message
    );
  }
};

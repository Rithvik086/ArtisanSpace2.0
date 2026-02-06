import type { Request, Response } from "express";
import cloudinary from "../config/cloudinary.js";
import {
  addRequest,
  approveRequest,
  deleteRequest,
  getRequests,
} from "../services/customRequestService.js";

export const getCustomRequests = async (req: Request, res: Response) => {
  try {
    // Get the current artisan's ID from the session
    const currentArtisanId = req.user.id as string; // Adjust based on your auth system

    if (!currentArtisanId) {
      res.status(400).json({
        success: false,
        message: "Artisan ID is required to fetch requests.",
      });
      return;
    }

    const availableRequests = await getRequests(false);

    const acceptedRequests = await getRequests(true, currentArtisanId);

    res.status(200).json({
      success: true,
      availableRequests,
      acceptedRequests,
    });
  } catch (error) {
    throw new Error("Error processing request: " + (error as Error).message);
  }
};

export const getUserCustomRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id as string;
    const requests = await getRequests(null, null); // Get all, then filter by userId
    const userRequests = requests.filter(
      (req: any) => req.userId._id.toString() === userId
    );

    res.status(200).json({
      success: true,
      requests: userRequests,
    });
  } catch (error) {
    throw new Error(
      "Error fetching user requests: " + (error as Error).message
    );
  }
};

export const reqCustomOrder = async (req: Request, res: Response) => {
  try {
    const { title, type, description, budget, requiredBy } = req.body;

    // Enhanced validation
    if (!title || !type || !description || !budget || !requiredBy) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled!",
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Title must be at least 3 characters long",
      });
    }

    const titleRegex = /^[a-zA-Z0-9\s\-']+$/;
    if (!titleRegex.test(title.trim())) {
      return res.status(400).json({
        success: false,
        message:
          "Title can only contain letters, numbers, spaces, hyphens, and apostrophes",
      });
    }

    if (type.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Type must be at least 2 characters long",
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Description must be at least 10 characters long",
      });
    }

    // Validate budget format
    const budgetRegex = /^\$?\d+(\.\d{2})?$/;
    if (!budgetRegex.test(budget.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid budget format (e.g., $500 or 500)",
      });
    }

    // Validate requiredBy date
    const selectedDate = new Date(requiredBy);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Required by date must be today or in the future",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only image files (JPEG, PNG, GIF, WebP) are allowed",
      });
    }

    // Check file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "Image file size must be less than 5MB",
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path);
    const newrequest = await addRequest(
      req.user.id,
      title.trim(),
      type.trim(),
      result.secure_url,
      description.trim(),
      budget.trim(),
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

export const approveCustomRequest = async (req: Request, res: Response) => {
  try {
    const approvingartisanid = req.user.id as string;
    await approveRequest(req.body.requestId as string, approvingartisanid);

    res
      .status(200)
      .json({ success: true, message: "Request approved successfully" });
  } catch (error) {
    throw new Error(
      "Error approving custom request: " + (error as Error).message
    );
  }
};

export const deleteCustomRequest = async (req: Request, res: Response) => {
  try {
    await deleteRequest(req.params.requestId as string);
    res
      .status(200)
      .json({ success: true, message: "Request approved successfully" });
  } catch (error) {
    throw new Error(
      "Error deleting custom request: " + (error as Error).message
    );
  }
};

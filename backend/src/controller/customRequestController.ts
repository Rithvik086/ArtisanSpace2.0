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

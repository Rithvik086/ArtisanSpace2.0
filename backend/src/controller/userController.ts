import { addTicket } from "../services/ticketServices.js";
import { removeUser, updateUser, getUsers } from "../services/userServices.js";
import type { Request, Response } from "express";
import { z } from "zod";

const submitTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
});

const updateProfileSchema = z.object({
  name: z.string().optional(),
  mobile_no: z.string().optional(),
  address: z.string().optional(),
});

export const submitSuppotTicket = async (req: Request, res: Response) => {
  try {
    const validated = submitTicketSchema.parse(req.body);
    const { subject, category, description } = validated;

    const newTicket = await addTicket(
      req.user.id,
      subject,
      category,
      description
    );
    res.json({
      success: true,
      message: "Ticket submitted successfully!",
      ticket: newTicket,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || "Validation error",
      });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to submit ticket. Please try again later.",
    });
  }
};

export const updatProfile = async (req: Request, res: Response) => {
  try {
    const validated = updateProfileSchema.parse(req.body);
    const { name, mobile_no, address } = validated;

    const processedAddress = address ? address.toLowerCase() : address;
    const processedName = name ? name.toLowerCase() : name;
    const result = await updateUser(
      req.user.id,
      processedName,
      mobile_no,
      processedAddress
    );

    if (result.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues?.[0]?.message || "Validation error",
      });
    }
    console.error(error);
    res.status(500).json({ success: false });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const result = await removeUser(req.user.id);

    if (result.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const getCustomerChart = async (req: Request, res: Response) => {
  try {
    const customers = await getUsers();
    const formatted = customers.map((c) => ({
      registeredAt: c._id.getTimestamp(),
    }));
    res.json(formatted);
  } catch (error) {
    console.error("Error fetching customer chart data:", error);
    res.status(500).json({
      success: false,
      message:
        "Failed to retrieve customer chart data. Please try again later.",
    });
  }
};

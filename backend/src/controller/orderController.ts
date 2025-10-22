import type { Request, Response } from "express";
import {
  getOrderByOrderId,
  placeUserOrder,
} from "../services/orderServices.js";

export const getOrderById = async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  if (!orderId) {
    return res.status(400).send("Order ID is required");
  }
  try {
    const order = await getOrderByOrderId(orderId);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    res.status(200).json({ success: true, order });
  } catch (e) {
    throw new Error("Error in getting order by ID: " + (e as Error).message);
  }
};

export const placeOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const response = await placeUserOrder(userId);

    if (response.success) {
      res.status(200).json(response);
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to place Order!" });
    }
  } catch (e) {
    throw new Error("Error in placing order: " + (e as Error).message);
  }
};

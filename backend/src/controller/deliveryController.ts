import type { Request, Response } from "express";
import {
  acceptOrderService,
  completeOrderService,
  getAvailableOrdersService,
  getMyOrdersService,
} from "../services/deliveryService.js";

export const getAvailableOrders = async (req: Request, res: Response) => {
  try {
    const response = await getAvailableOrdersService();
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const acceptOrder = async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const deliveryPersonId = req.user.id;

  try {
    const response = await acceptOrderService(orderId, deliveryPersonId);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(400).json(response);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const completeOrder = async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const deliveryPersonId = req.user.id;

  try {
    const response = await completeOrderService(orderId, deliveryPersonId);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(400).json(response);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  const deliveryPersonId = req.user.id;

  try {
    const response = await getMyOrdersService(deliveryPersonId);
    if (response.success) {
      res.status(200).json(response);
    } else {
      res.status(500).json(response);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

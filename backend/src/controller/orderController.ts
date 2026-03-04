import type { Request, Response } from "express";
import {
  changeOrderStatus,
  deleteOrderById,
  getOrderByOrderId,
  getOrdersByUserId,
  placeUserOrder,
} from "../services/orderServices.js";
import logger from "../utils/logger.js";

export const getOrderById = async (req: Request, res: Response) => {
  const orderId = req.params.orderId;
  if (!orderId) {
    return res
      .status(400)
      .json({ success: false, message: "Order ID is required" });
  }
  try {
    const order = await getOrderByOrderId(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (e) {
    logger.error(
      { error: (e as Error).message, orderId: req.params.orderId },
      "Error in getting order by ID",
    );
    res.status(500).json({ success: false, message: "Error fetching order" });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const orders = await getOrdersByUserId(userId);
    res.status(200).json({ success: true, orders });
  } catch (e) {
    logger.error(
      { error: (e as Error).message, userId: req.user.id },
      "Error in getting user orders",
    );
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

export const placeOrder = async (req: Request, res: Response) => {
  try {
    // IMPORTANT: Orders should only be placed through payment webhook
    // This endpoint is deprecated and blocked for security
    logger.warn(
      { userId: req.user.id },
      "Attempt to place order without payment - blocked",
    );
    return res.status(403).json({
      success: false,
      message:
        "Orders must be placed through payment gateway. Please complete payment first.",
    });
  } catch (e) {
    logger.error(
      { error: (e as Error).message, userId: req.user.id },
      "Error in placing order",
    );
    const errorMessage = (e as Error).message || "Failed to place order";
    res.status(500).json({ success: false, message: errorMessage });
  }
};

export const changeStatus = async (req: Request, res: Response) => {
  const orderId = req.params.orderId as string;
  const { status } = req.body;
  try {
    const response = await changeOrderStatus(orderId, status);
    if (response.success) {
      return res
        .status(200)
        .json({ success: true, message: "Status updated successfully" });
    }
    res.status(400).json({
      success: false,
      message: response.message || "Failed to update status",
    });
  } catch (error) {
    logger.error(
      { error: (error as Error).message, orderId: req.params.orderId },
      "Error in changing order status",
    );
    res
      .status(500)
      .json({ success: false, message: "Error updating order status" });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId as string;

    const response = await deleteOrderById(orderId);
    if (response.success) {
      return res
        .status(200)
        .json({ success: true, message: "Order deleted successfully" });
    }
    res.status(400).json({
      success: false,
      message: response.message || "Failed to delete order",
    });
  } catch (error) {
    logger.error(
      { error: (error as Error).message, orderId: req.params.orderId },
      "Error in deleting order",
    );
    res.status(500).json({ success: false, message: "Error deleting order" });
  }
};

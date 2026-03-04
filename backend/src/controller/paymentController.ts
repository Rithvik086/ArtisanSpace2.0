import {
  createOrder,
  getAmount,
  savePayment,
  updateOrderPaymentStatus,
  clearCartAfterPayment,
} from "../services/paymentService.js";
import type { Request, Response } from "express";
import { placeUserOrder } from "../services/orderServices.js";
import crypto from "crypto";
import config from "../config/index.js";
import logger from "../utils/logger.js";

export const createPaymentOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const amount = await getAmount(userId);
    if (amount <= 0)
      return res.status(400).json({ error: "Cart is empty or invalid amount" });

    const order = await createOrder(amount, userId);

    logger.info(
      { userId, orderId: order.id, amount: order.amount },
      "Payment order created",
    );
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    logger.error(
      { error: (err as Error).message, userId: req.user?.id },
      "Error creating payment order",
    );
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating payment order: " + (err as Error).message,
      });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const webhookSecret = config.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"] as string;

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expectedSignature) {
      logger.warn("Invalid webhook signature");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;
    const userId = paymentEntity.notes?.userId;

    if (event === "payment.captured") {
      logger.info(
        { userId, paymentId: paymentEntity.id },
        "Payment captured, placing order",
      );

      // Place order (already includes payment info and cart removal)
      await placeUserOrder(userId, paymentEntity.id);

      // Save payment record for tracking
      await savePayment(
        userId,
        paymentEntity.order_id,
        paymentEntity.id,
        paymentEntity.amount / 100,
        "success",
      );

      logger.info(
        { userId, paymentId: paymentEntity.id },
        "Order placed successfully after payment",
      );
    } else if (event === "payment.failed") {
      logger.warn({ userId, paymentId: paymentEntity.id }, "Payment failed");
      await savePayment(
        userId,
        paymentEntity.order_id,
        paymentEntity.id,
        paymentEntity.amount / 100,
        "failed",
      );
    }
    res.json({ status: "ok" });
  } catch (err) {
    logger.error(
      { error: (err as Error).message },
      "Webhook processing failed",
    );
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

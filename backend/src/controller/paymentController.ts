import { error } from "console";
import { createOrder, getAmount } from "../services/paymentService.js";
import type { Request, Response } from "express";
import { create } from "domain";

export const createPaymentOrder = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const amount = await getAmount(userId);
        if (amount <= 0) return res.status(400).json({ error: "Cart is empty or invalid amount" });  // <-- Add this

        const order = await createOrder(amount);

        res.json({ orderId: order.id, amount: order.amount, currency: order.currency })


    } catch (err) {
        res.status(500).json({ success: false, message: "Error creating payment order" + err });
    }
}
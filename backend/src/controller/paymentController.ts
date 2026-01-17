import { error } from "console";
import { createOrder, getAmount, savePayment, updateOrderPaymentStatus, clearCartAfterPayment } from "../services/paymentService.js";
import type { Request, Response } from "express";
import crypto from 'crypto';
import config from "../config/index.js";

export const createPaymentOrder = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const amount = await getAmount(userId);
        if (amount <= 0) return res.status(400).json({ error: "Cart is empty or invalid amount" });

        const order = await createOrder(amount);

        res.json({ orderId: order.id, amount: order.amount, currency: order.currency })


    } catch (err) {
        res.status(500).json({ success: false, message: "Error creating payment order: " + (err as Error).message });
    }
}

export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, orderId } = req.body;
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto.createHmac('sha256', config.RAZORPAY_SECRET).update(sign).digest('hex');

        if (razorpay_signature === expectedSign) {
            const userId = req.user?.id;
            await savePayment(userId, razorpay_order_id, razorpay_payment_id, amount, 'success');
            await updateOrderPaymentStatus(orderId, razorpay_payment_id, 'paid');
            await clearCartAfterPayment(userId);
            res.json({ success: true, message: 'Payment verified' });
        } else {
            res.status(400).json({ error: 'Payment verification failed' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Verification error' });
    }
};
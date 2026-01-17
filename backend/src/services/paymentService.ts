import { getUserCart } from "./cartServices.js";
import razorpay from "../config/razorpay.js";
import logger from "../utils/logger.js";
import { error } from "console";
// // using userId instead of cartId cause at any given point of time user has only one cart
export async function getAmount(userId: string) {
    try {
        const cart = await getUserCart(userId);

        let amount = 0;
        for (const item of cart) {
            amount += item.quantity * (item.productId as any).newPrice;
        }

        const tax = amount * 0.18;
        const shipping = amount * 0.05;

        const totalAmount = Math.round(amount + tax + shipping); // ₹ integer

        return totalAmount;
    } catch (e) {
        logger.error({ error: (e as Error).message }, "Failed to get amount");
        throw new Error("Error calculating amount: " + (e as Error).message);
    }
}


export async function createOrder(amount: number) {
    try {
        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        })
        return razorpayOrder
    } catch (err: any) {
        logger.error(
            {
                name: err?.name,
                message: err?.message,
                statusCode: err?.statusCode,
                razorpayError: err?.error,      
                stack: err?.stack,
            },
            "Razorpay order creation failed"
        );
        const desc = err?.error?.description || "Unknow Razorpay erro"
        throw new Error("Error in creating order: " + { desc });
    }
}

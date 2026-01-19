import mongoose, { Types } from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: {
        type: Types.ObjectId,
        required: true,
        ref: "User",
    },
    razorpayOrderId: {
        type: String,
        required: true,
    },
    razorpayPaymentId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        default: "INR",
    },
    status: {
        type: String,
        required: true,
        enum: ["pending", "success", "failed", "cancelled"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
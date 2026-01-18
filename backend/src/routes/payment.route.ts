import { Router } from "express";
import { createPaymentOrder, handleWebhook } from "../controller/paymentController.js";
import { verifytoken } from "../middleware/authMiddleware.js";
const router = Router();

// Webhook must be before auth middleware
router.post('/webhooks/razorpay', handleWebhook);

// Protected routes
router.use(verifytoken);
router.post('/create-order', createPaymentOrder);


export default router;


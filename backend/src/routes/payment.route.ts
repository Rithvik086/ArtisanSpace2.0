import { Router } from "express";
import { createPaymentOrder,verifyPayment } from "../controller/paymentController.js";
import { verifytoken } from "../middleware/authMiddleware.js";
const router = Router();

router.use(verifytoken);
// router.get('/webhooks/razorpay', webhookhandler);
router.post('/create-order', createPaymentOrder);
router.post('/verify-payment', verifyPayment);


export default router;


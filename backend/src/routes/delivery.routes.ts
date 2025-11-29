import { Router } from "express";
import {
  acceptOrder,
  completeOrder,
  getAvailableOrders,
  getMyOrders,
} from "../controller/deliveryController.js";
import { verifytoken } from "../middleware/authMiddleware.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = Router();

router.use(verifytoken);
router.use(authorizerole("delivery"));

router.get("/available", getAvailableOrders);
router.post("/accept", acceptOrder);
router.post("/complete", completeOrder);
router.get("/my-orders", getMyOrders);

export default router;

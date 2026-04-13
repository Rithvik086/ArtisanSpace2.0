import express from "express";
import {
  getB2BCapabilities,
  getB2BOrderDetails,
  getB2BProductDetails,
  getB2BSales,
  listB2BOrders,
  listB2BProducts,
  patchB2BOrderStatus,
} from "../controller/b2bController.js";
import { verifytoken } from "../middleware/authMiddleware.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifytoken);
router.use(authorizerole("artisan"));

router.get("/", getB2BCapabilities);
router.get("/products", listB2BProducts);
router.get("/products/:id", getB2BProductDetails);
router.get("/orders", listB2BOrders);
router.get("/orders/:orderId", getB2BOrderDetails);
router.patch("/orders/:orderId/status", patchB2BOrderStatus);
router.get("/analytics/sales", getB2BSales);

export default router;

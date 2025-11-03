import express from "express";
import {
  changeStatus,
  deleteOrder,
  getOrderById,
  placeOrder,
} from "../controller/orderController.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/:orderId",
  authorizerole("customer", "artisan", "manager", "admin"),
  getOrderById
);

router.post(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  placeOrder
);

router.put("/:orderId/status", authorizerole("manager", "admin"), changeStatus);

router.delete("/:orderId", authorizerole("admin"), deleteOrder);

export default router;

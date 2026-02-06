import express from "express";
import {
  changeStatus,
  deleteOrder,
  getOrderById,
  getUserOrders,
  placeOrder,
} from "../controller/orderController.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/user",
  authorizerole("customer", "artisan", "manager", "admin"),
  getUserOrders
);

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

router.delete("/:orderId", authorizerole("manager", "admin"), deleteOrder);

export default router;

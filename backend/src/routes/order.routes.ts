import express from "express";
import { getOrderById, placeOrder } from "../controller/orderController.js";

const router = express.Router();

router.get("/:orderId", getOrderById);

router.post("/", placeOrder);

export default router;

import { Router } from "express";
import adminController from "../controller/adminController.js";

const router = Router();

router.get("/users", adminController.getUsersList);
router.get("/products", adminController.getProductsList);
router.get("/orders", adminController.getOrdersList);
router.get("/feedback", adminController.getFeedbackList);
router.get("/sales", adminController.getSalesData);

export default router;

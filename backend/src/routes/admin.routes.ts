import { Router } from "express";
import adminController from "../controller/adminController.js";
import { getUsers } from "../controller/userController.js";
import { verifytoken } from "../middleware/authMiddleware.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = Router();

router.use(verifytoken);

router.use(authorizerole("admin"));

router.get("/products", adminController.getProductsList);
router.get("/orders", adminController.getOrdersList);
router.get("/sales", adminController.getSalesData);
router.get("/users", getUsers);

export default router;

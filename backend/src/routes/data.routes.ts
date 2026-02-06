import express from "express";
import {
  getCustomerChart,
  getOrdersChart,
  getProductsChart,
} from "../controller/dataController.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authorizerole("admin", "manager", "artisan"));

router.get("/customer_chart", getCustomerChart);
router.get("/orders_chart", getOrdersChart);
router.get("/products_chart", getProductsChart);

export default router;

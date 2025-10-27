import express from "express";
import { addToCart, editCart, getCart } from "../controller/cartController.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  getCart
);
router.post(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  addToCart
);
router.put(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  editCart
);

export default router;

import express from "express";
import { addToCart, editCart, getCart } from "../controller/cartController.js";

const router = express.Router();

router.get("/", getCart);
router.post("/", addToCart);
router.post("/edit", editCart);

export default router;

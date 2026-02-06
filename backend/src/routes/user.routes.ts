import express from "express";
import { verifytoken } from "../middleware/authMiddleware.js";
import orderRoutes from "../routes/order.routes.js";
import dataRoutes from "../routes/data.routes.js";
import cartRoutes from "../routes/cart.routes.js";
import ticketRoutes from "../routes/ticket.routes.js";
import workshopRoutes from "../routes/workshop.routes.js";
import customRequestRoutes from "./customRequest.routes.js";
import { getUserSettings } from "../controller/userController.js";

const router = express.Router();

router.use(verifytoken);

router.use("/orders", orderRoutes);
router.use("/cart", cartRoutes);
router.use("/tickets", ticketRoutes);
router.use("/workshop", workshopRoutes);
router.use("/custom-request", customRequestRoutes);

router.use("/chart", dataRoutes);

router.get("/settings", getUserSettings);

export default router;

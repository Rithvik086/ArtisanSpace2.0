import express from "express";
import {
  deleteTicket,
  getSupportTickets,
  submitSuppotTicket,
} from "../controller/ticketController.js";
import authorizerole from "../middleware/roleMiddleware.js";
import { verifytoken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifytoken);

router.get("/", authorizerole("manager", "admin"), getSupportTickets);

router.post(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  submitSuppotTicket
);

router.post("/", authorizerole("manager", "admin"), deleteTicket);

export default router;

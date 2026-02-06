import express from "express";
import {
  deleteTicket,
  getSupportTickets,
  submitSuppotTicket,
} from "../controller/ticketController.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authorizerole("manager", "admin"), getSupportTickets);

router.post(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  submitSuppotTicket
);

router.post("/", authorizerole("manager", "admin"), deleteTicket);

export default router;

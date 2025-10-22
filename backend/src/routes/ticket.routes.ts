import express from "express";
import { submitSuppotTicket } from "../controller/ticketController.js";

const router = express.Router();

router.post("/", submitSuppotTicket);

export default router;

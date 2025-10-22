import express from "express";
import { bookUserWorkshop } from "../controller/workshopController.js";

const router = express.Router();

router.post("/requestWorkshop", bookUserWorkshop);

export default router;

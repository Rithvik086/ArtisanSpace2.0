import { Router } from "express";
import settingsController from "../controller/settingsController.js";

const router = Router();

// GET /api/settings
router.get("/settings", settingsController.getSettings);

export default router;

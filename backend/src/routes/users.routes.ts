import express from "express";
import { getUsers } from "../controller/userController.js";
import { verifytoken } from "../middleware/authMiddleware.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

// GET /api/v1/users/  (manager+ only)
router.get("/", verifytoken, authorizerole("manager", "admin"), getUsers);

export default router;

import express from "express";

import {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  deleteAccount,
  updatProfile,
} from "../controller/authController.js";
import authorizerole from "../middleware/roleMiddleware.js";
import { verifytoken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.use(verifytoken);
router.use(authorizerole("customer", "artisan", "manager", "admin"));
router.post("/update-profile", updatProfile);
router.post("/delete-account", deleteAccount);

export default router;

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
  deleteUser,
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

// Authenticated routes
router.use(verifytoken);

// Authrorized routes
router.post(
  "/update-profile",
  authorizerole("customer", "artisan", "manager", "admin"),
  updatProfile
);

router.post(
  "/delete-account",
  authorizerole("customer", "artisan", "manager", "admin"),
  deleteAccount
);

router.delete("/user/:userId", authorizerole("manager", "admin"), deleteUser);

export default router;

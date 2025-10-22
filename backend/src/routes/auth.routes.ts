import express from "express";

import {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controller/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;

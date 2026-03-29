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
  addUserHandler,
  checkUsername,
  checkEmail,
  me,
} from "../controller/authController.js";
import authorizerole from "../middleware/roleMiddleware.js";
import { verifytoken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/check-username", checkUsername);
router.post("/check-email", checkEmail);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Authenticated routes
router.use(verifytoken);

router.get("/me", me);

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

/**
 * @swagger
 * /auth/user/{userId}:
 *   delete:
 *     summary: Delete user by ID (Manager/Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden - requires manager or admin role
 *       404:
 *         description: User not found
 */
router.delete("/user/:userId", authorizerole("manager", "admin"), deleteUser);

/**
 * @swagger
 * /auth/add-user:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - name
 *               - email
 *               - password
 *               - mobile_no
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username
 *               name:
 *                 type: string
 *                 description: Full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Password
 *               mobile_no:
 *                 type: string
 *                 minLength: 10
 *                 description: Mobile number
 *               role:
 *                 type: string
 *                 enum: [admin, manager, artisan, customer, delivery]
 *                 description: User role
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - requires admin role
 *       500:
 *         description: Internal server error
 */
router.post("/add-user", authorizerole("admin"), addUserHandler);

export default router;

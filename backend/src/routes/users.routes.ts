import express from "express";
import { getUsers } from "../controller/userController.js";
import { verifytoken } from "../middleware/authMiddleware.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

// GET /api/v1/users/  (manager+ only)
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Manager/Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *                     enum: [admin, manager, artisan, customer, delivery]
 *                   isVerified:
 *                     type: boolean
 *                   mobile_no:
 *                     type: string
 *                   address:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zip:
 *                         type: string
 *                       country:
 *                         type: string
 *       403:
 *         description: Forbidden - requires manager or admin role
 */
router.get("/", verifytoken, authorizerole("manager", "admin"), getUsers);

export default router;

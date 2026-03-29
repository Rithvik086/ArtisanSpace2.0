import express from "express";
import upload from "../middleware/multer.js";
import {
  approveCustomRequest,
  deleteCustomRequest,
  getCustomRequests,
  getUserCustomRequests,
  reqCustomOrder,
} from "../controller/customRequestController.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /custom-requests:
 *   get:
 *     summary: Get all custom requests (Artisan/Manager/Admin)
 *     tags: [Custom Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of custom requests
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authorizerole("artisan", "manager", "admin"),
  getCustomRequests
);

/**
 * @swagger
 * /custom-requests/user:
 *   get:
 *     summary: Get user's custom requests
 *     tags: [Custom Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's custom requests
 *       403:
 *         description: Forbidden
 */
router.get(
  "/user",
  authorizerole("customer", "artisan", "manager", "admin"),
  getUserCustomRequests
);

/**
 * @swagger
 * /custom-requests:
 *   post:
 *     summary: Create a custom request
 *     tags: [Custom Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               details:
 *                 type: string
 *     responses:
 *       201:
 *         description: Custom request created successfully
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  upload.single("image"),
  reqCustomOrder
);

/**
 * @swagger
 * /custom-requests:
 *   put:
 *     summary: Approve or respond to a custom request (Artisan/Manager/Admin)
 *     tags: [Custom Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestId:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Custom request updated successfully
 *       403:
 *         description: Forbidden
 */
router.put(
  "/",
  authorizerole("artisan", "manager", "admin"),
  approveCustomRequest
);

router.delete(
  "/:requestId",
  authorizerole("manager", "admin"),
  deleteCustomRequest
);

export default router;

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
import { verifytoken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifytoken);

/**
 * @swagger
 * /user/custom-request:
 *   get:
 *     summary: Get all custom requests (Artisan/Manager/Admin)
 *     tags: [Artisan Custom Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, in-progress]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of all custom requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   customerId:
 *                     type: object
 *                   description:
 *                     type: string
 *                   image:
 *                     type: string
 *                   status:
 *                     type: string
 *                   artisanResponse:
 *                     type: string
 *                   quotedPrice:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       403:
 *         description: Forbidden - requires artisan role
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authorizerole("artisan", "manager", "admin"),
  getCustomRequests
);

/**
 * @swagger
 * /user/custom-request/user:
 *   get:
 *     summary: Get user's own custom requests
 *     tags: [Customer Custom Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, in-progress]
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of user's custom requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   description:
 *                     type: string
 *                   image:
 *                     type: string
 *                   status:
 *                     type: string
 *                   budget:
 *                     type: number
 *                   artisanResponse:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/user",
  authorizerole("customer", "artisan", "manager", "admin"),
  getUserCustomRequests
);

/**
 * @swagger
 * /user/custom-request:
 *   post:
 *     summary: Create a new custom request
 *     tags: [Customer Custom Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 description: Detailed description of the custom product needed
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Reference image for the custom product
 *               budget:
 *                 type: number
 *                 description: Budget for the custom product
 *               deadline:
 *                 type: string
 *                 format: date
 *                 description: Desired completion/delivery date
 *               specifications:
 *                 type: string
 *                 description: Additional specifications and requirements
 *               preferredArtisan:
 *                 type: string
 *                 description: Optional - ID of preferred artisan
 *     responses:
 *       201:
 *         description: Custom request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 customRequest:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     customerId:
 *                       type: string
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  upload.single("image"),
  reqCustomOrder
);

/**
 * @swagger
 * /user/custom-request:
 *   put:
 *     summary: Approve or respond to a custom request (Artisan/Manager/Admin)
 *     tags: [Artisan Custom Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *               - status
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: Custom request ID
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, in-progress, completed]
 *                 description: New status for the request
 *               artisanResponse:
 *                 type: string
 *                 description: Artisan's response to the request
 *               quotedPrice:
 *                 type: number
 *                 description: Quoted price for the custom product
 *               estimatedDelivery:
 *                 type: string
 *                 format: date
 *                 description: Estimated delivery date
 *               rejectionReason:
 *                 type: string
 *                 description: Reason for rejection (if status is rejected)
 *     responses:
 *       200:
 *         description: Custom request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 customRequest:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     artisanResponse:
 *                       type: string
 *                     quotedPrice:
 *                       type: number
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Forbidden - requires artisan role
 *       404:
 *         description: Custom request not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/",
  authorizerole("artisan", "manager", "admin"),
  approveCustomRequest
);

/**
 * @swagger
 * /user/custom-request/{requestId}:
 *   delete:
 *     summary: Delete a custom request (Manager/Admin only)
 *     tags: [Artisan Custom Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Custom request ID to delete
 *     responses:
 *       200:
 *         description: Custom request deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       403:
 *         description: Forbidden - requires manager or admin role
 *       404:
 *         description: Custom request not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:requestId",
  authorizerole("manager", "admin"),
  deleteCustomRequest
);

export default router;

import { Router } from "express";
import {
  acceptOrder,
  completeOrder,
  getAvailableOrders,
  getMyOrders,
} from "../controller/deliveryController.js";
import { verifytoken } from "../middleware/authMiddleware.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = Router();

router.use(verifytoken);
router.use(authorizerole("delivery", "admin"));

/**
 * @swagger
 * /delivery/available:
 *   get:
 *     summary: Get available orders for delivery
 *     tags: [Delivery Management]
 *     responses:
 *       200:
 *         description: List of available orders for delivery
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           address:
 *                             type: object
 *                           mobile_no:
 *                             type: string
 *                       products:
 *                         type: array
 *                       status:
 *                         type: string
 *                         enum: [pending, shipped]
 *                       money:
 *                         type: number
 *       403:
 *         description: Forbidden - requires delivery role
 *       500:
 *         description: Internal server error
 */
router.get("/available", getAvailableOrders);

/**
 * @swagger
 * /delivery/accept:
 *   post:
 *     summary: Accept a delivery order
 *     tags: [Delivery Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID of the order to accept
 *     responses:
 *       200:
 *         description: Order accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 order:
 *                   type: object
 *                   description: The accepted order details
 *       400:
 *         description: Order not found or already assigned
 *       403:
 *         description: Forbidden - requires delivery role
 *       500:
 *         description: Internal server error
 */
router.post("/accept", acceptOrder);

/**
 * @swagger
 * /delivery/complete:
 *   post:
 *     summary: Mark delivery as completed
 *     tags: [Delivery Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID of the order to mark as completed
 *     responses:
 *       200:
 *         description: Delivery completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 order:
 *                   type: object
 *                   description: The completed order details
 *       400:
 *         description: Order not found or not assigned to you
 *       403:
 *         description: Forbidden - requires delivery role
 *       500:
 *         description: Internal server error
 */
router.post("/complete", completeOrder);

/**
 * @swagger
 * /delivery/my-orders:
 *   get:
 *     summary: Get assigned delivery orders
 *     tags: [Delivery Management]
 *     responses:
 *       200:
 *         description: List of orders assigned to the delivery person
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           address:
 *                             type: object
 *                           mobile_no:
 *                             type: string
 *                       products:
 *                         type: array
 *                       status:
 *                         type: string
 *                         enum: [shipped, delivered]
 *                       money:
 *                         type: number
 *                       deliveryPersonId:
 *                         type: string
 *       403:
 *         description: Forbidden - requires delivery role
 *       500:
 *         description: Internal server error
 */
router.get("/my-orders", getMyOrders);

export default router;

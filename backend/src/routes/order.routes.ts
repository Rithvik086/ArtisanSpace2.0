import express from "express";
import {
  changeStatus,
  deleteOrder,
  getOrderById,
  getUserOrders,
  placeOrder,
} from "../controller/orderController.js";
import authorizerole from "../middleware/roleMiddleware.js";
import { verifytoken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifytoken);

/**
 * @swagger
 * /user/orders/user:
 *   get:
 *     summary: Get all customer orders
 *     tags: [Customer Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, shipped, delivered, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of customer orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   orderId:
 *                     type: string
 *                   products:
 *                     type: array
 *                   totalAmount:
 *                     type: number
 *                   status:
 *                     type: string
 *                   paymentStatus:
 *                     type: string
 *                   deliveryAddress:
 *                     type: object
 *                   createdAt:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/user",
  authorizerole("customer", "artisan", "manager", "admin"),
  getUserOrders
);

/**
 * @swagger
 * /user/orders/{orderId}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Customer Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 orderId:
 *                   type: string
 *                 userId:
 *                   type: object
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       productName:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       price:
 *                         type: number
 *                       image:
 *                         type: string
 *                 totalAmount:
 *                   type: number
 *                 status:
 *                   type: string
 *                 paymentStatus:
 *                   type: string
 *                 paymentMethod:
 *                   type: string
 *                 deliveryAddress:
 *                   type: object
 *                 trackingNumber:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:orderId",
  authorizerole("customer", "artisan", "manager", "admin"),
  getOrderById
);

/**
 * @swagger
 * /user/orders:
 *   post:
 *     summary: Place a new order from cart
 *     tags: [Customer Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryAddress
 *             properties:
 *               deliveryAddress:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - zip
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zip:
 *                     type: string
 *                   country:
 *                     type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [razorpay, cod, wallet]
 *                 description: Payment method for the order
 *               phoneNumber:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     orderId:
 *                       type: string
 *                     totalAmount:
 *                       type: number
 *                     status:
 *                       type: string
 *       400:
 *         description: Invalid request or empty cart
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  placeOrder
);

/**
 * @swagger
 * /user/orders/{orderId}/status:
 *   put:
 *     summary: Update order status (Manager/Admin only)
 *     tags: [Customer Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, shipped, delivered, cancelled]
 *               trackingNumber:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       403:
 *         description: Forbidden - requires manager or admin role
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put("/:orderId/status", authorizerole("manager", "admin"), changeStatus);

/**
 * @swagger
 * /user/orders/{orderId}:
 *   delete:
 *     summary: Cancel/delete an order (Manager/Admin only)
 *     tags: [Customer Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID to delete
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       403:
 *         description: Forbidden - requires manager or admin role
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:orderId", authorizerole("manager", "admin"), deleteOrder);

export default router;

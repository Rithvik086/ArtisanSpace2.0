import express from "express";
import {
  getB2BCapabilities,
  getB2BOrderDetails,
  getB2BProductDetails,
  getB2BSales,
  listB2BOrders,
  listB2BProducts,
  patchB2BOrderStatus,
} from "../controller/b2bController.js";
import { verifytoken } from "../middleware/authMiddleware.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifytoken);
router.use(authorizerole("artisan"));

/**
 * @swagger
 * /b2b:
 *   get:
 *     summary: Get B2B capabilities and information
 *     tags: [B2B Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: B2B capabilities information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 capabilities:
 *                   type: object
 *                   properties:
 *                     bulkOrderSupport:
 *                       type: boolean
 *                     minimumOrderQuantity:
 *                       type: number
 *                     availableDiscounts:
 *                       type: array
 *                       items:
 *                         type: object
 *                     paymentTerms:
 *                       type: array
 *       403:
 *         description: Forbidden - requires artisan role
 *       500:
 *         description: Internal server error
 */
router.get("/", getB2BCapabilities);

/**
 * @swagger
 * /b2b/products:
 *   get:
 *     summary: List all B2B products
 *     tags: [B2B Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by product category
 *     responses:
 *       200:
 *         description: List of B2B products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       bulkPrice:
 *                         type: number
 *                       minimumOrder:
 *                         type: number
 *                       category:
 *                         type: string
 *                       availability:
 *                         type: number
 *                 pagination:
 *                   type: object
 *       403:
 *         description: Forbidden - requires artisan role
 *       500:
 *         description: Internal server error
 */
router.get("/products", listB2BProducts);

/**
 * @swagger
 * /b2b/products/{id}:
 *   get:
 *     summary: Get B2B product details
 *     tags: [B2B Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: B2B product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 product:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     images:
 *                       type: array
 *                     regularPrice:
 *                       type: number
 *                     bulkPrice:
 *                       type: number
 *                     minimumOrder:
 *                       type: number
 *                     category:
 *                       type: string
 *                     specifications:
 *                       type: object
 *                     availability:
 *                       type: number
 *                     deliveryTime:
 *                       type: string
 *       403:
 *         description: Forbidden - requires artisan role
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get("/products/:id", getB2BProductDetails);

/**
 * @swagger
 * /b2b/orders:
 *   get:
 *     summary: List B2B orders
 *     tags: [B2B Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of B2B orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       orderId:
 *                         type: string
 *                       buyer:
 *                         type: object
 *                       products:
 *                         type: array
 *                       totalAmount:
 *                         type: number
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *       403:
 *         description: Forbidden - requires artisan role
 *       500:
 *         description: Internal server error
 */
router.get("/orders", listB2BOrders);

/**
 * @swagger
 * /b2b/orders/{orderId}:
 *   get:
 *     summary: Get B2B order details
 *     tags: [B2B Management]
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
 *                 success:
 *                   type: boolean
 *                 order:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     orderId:
 *                       type: string
 *                     buyer:
 *                       type: object
 *                     products:
 *                       type: array
 *                     quantities:
 *                       type: array
 *                     totalAmount:
 *                       type: number
 *                     discount:
 *                       type: number
 *                     status:
 *                       type: string
 *                     paymentStatus:
 *                       type: string
 *                     deliveryAddress:
 *                       type: object
 *                     createdAt:
 *                       type: string
 *       403:
 *         description: Forbidden - requires artisan role
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get("/orders/:orderId", getB2BOrderDetails);

/**
 * @swagger
 * /b2b/orders/{orderId}/status:
 *   patch:
 *     summary: Update B2B order status
 *     tags: [B2B Management]
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
 *                 enum: [confirmed, processing, shipped, delivered, cancelled]
 *                 description: New order status
 *               trackingNumber:
 *                 type: string
 *                 description: Shipping tracking number
 *               notes:
 *                 type: string
 *                 description: Additional notes about the order
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 order:
 *                   type: object
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Forbidden - requires artisan role
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.patch("/orders/:orderId/status", patchB2BOrderStatus);

/**
 * @swagger
 * /b2b/analytics/sales:
 *   get:
 *     summary: Get B2B sales analytics
 *     tags: [B2B Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [weekly, monthly, quarterly, yearly]
 *         description: Analytics period
 *     responses:
 *       200:
 *         description: B2B sales analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     totalSales:
 *                       type: number
 *                     totalOrders:
 *                       type: number
 *                     averageOrderValue:
 *                       type: number
 *                     topProducts:
 *                       type: array
 *                     topBuyers:
 *                       type: array
 *                     salesTrend:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           sales:
 *                             type: number
 *                           orders:
 *                             type: number
 *       403:
 *         description: Forbidden - requires artisan role
 *       500:
 *         description: Internal server error
 */
router.get("/analytics/sales", getB2BSales);

export default router;

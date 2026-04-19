import express from "express";
import { verifytoken } from "../middleware/authMiddleware.js";
import orderRoutes from "../routes/order.routes.js";
import dataRoutes from "../routes/data.routes.js";
import cartRoutes from "../routes/cart.routes.js";
import ticketRoutes from "../routes/ticket.routes.js";
import workshopRoutes from "../routes/workshop.routes.js";
import customRequestRoutes from "./customRequest.routes.js";
import { getUserSettings } from "../controller/userController.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(verifytoken);

/**
 * @swagger
 * /user/orders:
 *   get:
 *     summary: Get customer's orders
 *     tags: [Customer Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer's orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   products:
 *                     type: array
 *                   totalAmount:
 *                     type: number
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.use("/orders", orderRoutes);

/**
 * @swagger
 * /user/cart:
 *   get:
 *     summary: Get customer's shopping cart
 *     tags: [Customer Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                 totalPrice:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
router.use("/cart", cartRoutes);

/**
 * @swagger
 * /user/tickets:
 *   get:
 *     summary: Get customer's support tickets
 *     tags: [Customer Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of support tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       401:
 *         description: Unauthorized
 */
router.use("/tickets", ticketRoutes);

/**
 * @swagger
 * /user/workshop:
 *   get:
 *     summary: Get customer's booked workshops
 *     tags: [Customer Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of booked workshops
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       401:
 *         description: Unauthorized
 */
router.use("/workshop", workshopRoutes);

/**
 * @swagger
 * /user/custom-request:
 *   get:
 *     summary: Get customer's custom requests
 *     tags: [Customer Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of custom requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       401:
 *         description: Unauthorized
 */
router.use("/custom-request", customRequestRoutes);

/**
 * @swagger
 * /user/chart:
 *   get:
 *     summary: Get customer purchase analytics and charts
 *     tags: [Customer Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalSpent:
 *                   type: number
 *                 totalOrders:
 *                   type: number
 *                 monthlySpending:
 *                   type: array
 *       401:
 *         description: Unauthorized
 */
router.use("/chart", dataRoutes);

/**
 * @swagger
 * /user/settings:
 *   get:
 *     summary: Get user settings and preferences
 *     tags: [Customer Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 mobile_no:
 *                   type: string
 *                 address:
 *                   type: object
 *                   properties:
 *                     street:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     zip:
 *                       type: string
 *                 profileImage:
 *                   type: string
 *                 preferences:
 *                   type: object
 *                 notificationSettings:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/settings", getUserSettings);

/**
 * @swagger
 * /user/settings:
 *   put:
 *     summary: Update user settings and preferences
 *     tags: [Customer Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               mobile_no:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                     zip:
 *                       type: string
 *               preferences:
 *                 type: object
 *                 properties:
 *                   language:
 *                     type: string
 *                   currency:
 *                     type: string
 *               notificationSettings:
 *                 type: object
 *                 properties:
 *                   orderNotifications:
 *                     type: boolean
 *                   newsLetters:
 *                     type: boolean
 *                   promotionalEmails:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put("/settings", getUserSettings);

/**
 * @swagger
 * /user/dashboard:
 *   get:
 *     summary: Get customer dashboard overview
 *     tags: [Customer Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: number
 *                 totalSpent:
 *                   type: number
 *                 recentOrders:
 *                   type: array
 *                 wishlist:
 *                   type: array
 *                 recommendations:
 *                   type: array
 *       401:
 *         description: Unauthorized
 */
router.get("/dashboard", getUserSettings);

/**
 * @swagger
 * /user/wishlist:
 *   get:
 *     summary: Get customer's wishlist
 *     tags: [Customer Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /user/wishlist:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Customer Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of product to add to wishlist
 *     responses:
 *       200:
 *         description: Product added to wishlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 wishlist:
 *                   type: array
 *                   description: Updated wishlist items
 *       400:
 *         description: Product already in wishlist or invalid ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get("/wishlist", getUserSettings);
router.post("/wishlist", getUserSettings);

/**
 * @swagger
 * /user/addresses:
 *   get:
 *     summary: Get all saved addresses
 *     tags: [Customer Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   label:
 *                     type: string
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zip:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/addresses", getUserSettings);

/**
 * @swagger
 * /user/notifications:
 *   get:
 *     summary: Get customer notifications
 *     tags: [Customer Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of notifications to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *         description: Number of notifications to skip
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
router.get("/notifications", getUserSettings);

export default router;

import express from "express";
import { verifytoken } from "../middleware/authMiddleware.js";
import authorizerole from "../middleware/roleMiddleware.js";
import {
    getArtisanAnalytics,
    getArtisanOrderTrend,
} from "../controller/artisanController.js";

const router = express.Router();

// All routes require artisan role
router.use(verifytoken);
router.use(authorizerole("artisan"));

/**
 * @swagger
 * /artisan/dashboard:
 *   get:
 *     summary: Get artisan dashboard overview
 *     tags: [Artisan Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 6m, 1y]
 *         description: Analytics period (default 30d)
 *     responses:
 *       200:
 *         description: Dashboard overview with key metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 totalRevenue:
 *                   type: number
 *                 totalOrders:
 *                   type: number
 *                 thisMonthRevenue:
 *                   type: number
 *                 thisMonthOrders:
 *                   type: number
 *                 productStats:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     active:
 *                       type: number
 *                     pending:
 *                       type: number
 *                     rejected:
 *                       type: number
 *       403:
 *         description: Forbidden - requires artisan role
 *       500:
 *         description: Internal server error
 */
router.get("/dashboard", getArtisanAnalytics);

/**
 * @swagger
 * /artisan/revenue:
 *   get:
 *     summary: Get detailed revenue analytics
 *     tags: [Artisan Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 6m, 1y]
 *     responses:
 *       200:
 *         description: Revenue breakdown and trends
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: number
 *                 thisMonthRevenue:
 *                   type: number
 *                 dailyRevenue:
 *                   type: array
 *       403:
 *         description: Forbidden - requires artisan role
 */
router.get("/revenue", getArtisanAnalytics);

/**
 * @swagger
 * /artisan/orders:
 *   get:
 *     summary: Get order statistics and breakdown
 *     tags: [Artisan Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 6m, 1y]
 *     responses:
 *       200:
 *         description: Order stats with status breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: number
 *                 thisMonthOrders:
 *                   type: number
 *                 orderBreakdown:
 *                   type: object
 *                   properties:
 *                     pending:
 *                       type: number
 *                     shipped:
 *                       type: number
 *                     delivered:
 *                       type: number
 *                     cancelled:
 *                       type: number
 *                 recentOrders:
 *                   type: array
 *       403:
 *         description: Forbidden - requires artisan role
 */
router.get("/orders", getArtisanAnalytics);

/**
 * @swagger
 * /artisan/products:
 *   get:
 *     summary: Get product statistics
 *     tags: [Artisan Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product stats and top performers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productStats:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     active:
 *                       type: number
 *                     pending:
 *                       type: number
 *                     rejected:
 *                       type: number
 *                 topProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *       403:
 *         description: Forbidden - requires artisan role
 */
router.get("/products", getArtisanAnalytics);

/**
 * @swagger
 * /artisan/custom-requests:
 *   get:
 *     summary: Get custom requests statistics
 *     tags: [Artisan Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Custom request stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customRequests:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     accepted:
 *                       type: number
 *                     pending:
 *                       type: number
 *       403:
 *         description: Forbidden - requires artisan role
 */
router.get("/custom-requests", getArtisanAnalytics);

/**
 * @swagger
 * /artisan/workshops:
 *   get:
 *     summary: Get workshops statistics
 *     tags: [Artisan Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Workshop stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workshops:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     accepted:
 *                       type: number
 *                     pending:
 *                       type: number
 *       403:
 *         description: Forbidden - requires artisan role
 */
router.get("/workshops", getArtisanAnalytics);

/**
 * @swagger
 * /artisan/analytics:
 *   get:
 *     summary: Get comprehensive analytics dashboard for artisan
 *     tags: [Artisan Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Comprehensive analytics dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalRevenue:
 *                   type: number
 *                 totalOrders:
 *                   type: number
 *                 productStats:
 *                   type: object
 *                 customRequests:
 *                   type: object
 *                 workshops:
 *                   type: object
 *       403:
 *         description: Forbidden - requires artisan role
 *       500:
 *         description: Internal server error
 */
router.get("/analytics", getArtisanAnalytics);

/**
 * @swagger
 * /artisan/analytics/trend:
 *   get:
 *     summary: Get order and revenue trend for last 30 days
 *     tags: [Artisan Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order and revenue trend data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       orders:
 *                         type: number
 *                       revenue:
 *                         type: number
 *       403:
 *         description: Forbidden - requires artisan role
 *       500:
 *         description: Internal server error
 */
router.get("/analytics/trend", getArtisanOrderTrend);

/**
 * @swagger
 * /artisan/settings:
 *   get:
 *     summary: Get artisan settings and preferences
 *     tags: [Artisan Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Artisan settings and preferences
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 businessName:
 *                   type: string
 *                 email:
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
 *                 businessDescription:
 *                   type: string
 *                 certifications:
 *                   type: array
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     commissionRate:
 *                       type: number
 *                     bankDetails:
 *                       type: object
 *                     workshopSettings:
 *                       type: object
 *                 notificationSettings:
 *                   type: object
 *       403:
 *         description: Forbidden - requires artisan role
 *       500:
 *         description: Internal server error
 */
router.get("/settings", getArtisanAnalytics);

/**
 * @swagger
 * /artisan/settings:
 *   put:
 *     summary: Update artisan settings and preferences
 *     tags: [Artisan Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *               businessDescription:
 *                 type: string
 *               phone:
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
 *                   zip:
 *                     type: string
 *               bankDetails:
 *                 type: object
 *                 properties:
 *                   accountHolder:
 *                     type: string
 *                   accountNumber:
 *                     type: string
 *                   bankName:
 *                     type: string
 *                   ifsc:
 *                     type: string
 *               notificationSettings:
 *                 type: object
 *                 properties:
 *                   orderNotifications:
 *                     type: boolean
 *                   customRequestNotifications:
 *                     type: boolean
 *                   workshopNotifications:
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
 *       403:
 *         description: Forbidden - requires artisan role
 *       500:
 *         description: Internal server error
 */
router.put("/settings", getArtisanAnalytics);

export default router;

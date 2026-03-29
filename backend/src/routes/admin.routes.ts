import { Router } from "express";
import adminController from "../controller/adminController.js";
import { getUsers } from "../controller/userController.js";
import { verifytoken } from "../middleware/authMiddleware.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = Router();

router.use(verifytoken);

router.use(authorizerole("admin"));

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Get all products for admin dashboard
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products for admin
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   image:
 *                     type: string
 *                   name:
 *                     type: string
 *                   uploadedBy:
 *                     type: string
 *                   quantity:
 *                     type: number
 *                   oldPrice:
 *                     type: number
 *                   newPrice:
 *                     type: number
 *                   category:
 *                     type: string
 *                   status:
 *                     type: string
 *                   description:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   isValid:
 *                     type: boolean
 *       403:
 *         description: Forbidden - requires admin role
 */
router.get("/products", adminController.getProductsList);

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders for admin dashboard
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders for admin
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   customer:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   items:
 *                     type: number
 *                   total:
 *                     type: number
 *                   status:
 *                     type: string
 *       403:
 *         description: Forbidden - requires admin role
 */
router.get("/orders", adminController.getOrdersList);

/**
 * @swagger
 * /admin/sales:
 *   get:
 *     summary: Get sales data for admin dashboard
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales analytics data for admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   totalSales:
 *                     type: number
 *                   totalOrders:
 *                     type: number
 *                   totalRevenue:
 *                     type: number
 *                   monthlyData:
 *                     type: array
 *                     items:
 *                       type: object
 *       403:
 *         description: Forbidden - requires admin role
 */
router.get("/sales", adminController.getSalesData);

/**
 * @swagger
 * /admin/dashboard-overview:
 *   get:
 *     summary: Get dashboard overview metrics
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview data
 *       403:
 *         description: Forbidden - requires admin role
 */
router.get("/dashboard-overview", adminController.getDashboardOverview);

/**
 * @swagger
 * /admin/revenue-analytics:
 *   get:
 *     summary: Get revenue analytics with trends
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         default: monthly
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Revenue analytics data
 *       403:
 *         description: Forbidden - requires admin role
 */
router.get("/revenue-analytics", adminController.getRevenueAnalytics);

/**
 * @swagger
 * /admin/revenue-by-category:
 *   get:
 *     summary: Get revenue breakdown by product category
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Revenue by category data
 *       403:
 *         description: Forbidden - requires admin role
 */
router.get("/revenue-by-category", adminController.getRevenueByCategory);

/**
 * @swagger
 * /admin/geographic-revenue:
 *   get:
 *     summary: Get revenue distribution by geographic location
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Geographic revenue data
 *       403:
 *         description: Forbidden - requires admin role
 */
router.get("/geographic-revenue", adminController.getGeographicRevenue);

/**
 * @swagger
 * /admin/top-selling-products:
 *   get:
 *     summary: Get top-selling products by revenue or units
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [revenue, units]
 *           default: revenue
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Top-selling products data
 *       403:
 *         description: Forbidden - requires admin role
 */
router.get("/top-selling-products", adminController.getTopSellingProducts);

/**
 * @swagger
 * /admin/inventory-analytics:
 *   get:
 *     summary: Get inventory analytics and low-stock alerts
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Stock level threshold for low-stock alerts
 *     responses:
 *       200:
 *         description: Inventory analytics data
 *       403:
 *         description: Forbidden - requires admin role
 */
router.get("/inventory-analytics", adminController.getInventoryAnalytics);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users for admin dashboard
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users for admin
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
 *         description: Forbidden - requires admin role
 */
router.get("/users", getUsers);

export default router;

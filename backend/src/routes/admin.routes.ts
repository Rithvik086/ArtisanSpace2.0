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

import { Router } from "express";
import adminController from "../controller/adminController.js";
import { getUsers } from "../controller/userController.js";
import { verifytoken } from "../middleware/authMiddleware.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = Router();

router.use(verifytoken);

// Allow both admin and manager to access these endpoints
router.use(authorizerole("admin", "manager"));

/**
 * @swagger
 * /manager/products:
 *   get:
 *     summary: Get all products for manager/admin
 *     tags: [Manager/Admin Dashboard]
 *     responses:
 *       200:
 *         description: List of products
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
 *         description: Forbidden - requires manager or admin role
 */
router.get("/products", adminController.getProductsList);

/**
 * @swagger
 * /manager/orders:
 *   get:
 *     summary: Get all orders for manager/admin
 *     tags: [Manager/Admin Dashboard]
 *     responses:
 *       200:
 *         description: List of orders
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
 *         description: Forbidden - requires manager or admin role
 */
router.get("/orders", adminController.getOrdersList);

/**
 * @swagger
 * /manager/sales:
 *   get:
 *     summary: Get sales data for manager/admin
 *     tags: [Manager/Admin Dashboard]
 *     responses:
 *       200:
 *         description: Sales analytics data
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
 *         description: Forbidden - requires manager or admin role
 */
router.get("/sales", adminController.getSalesData);

/**
 * @swagger
 * /manager/users:
 *   get:
 *     summary: Get all users for manager/admin
 *     tags: [Manager/Admin Dashboard]
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
router.get("/users", getUsers);

export default router;

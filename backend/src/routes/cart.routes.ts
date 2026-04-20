import express from "express";
import { addToCart, editCart, getCart } from "../controller/cartController.js";
import authorizerole from "../middleware/roleMiddleware.js";
import { verifytoken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifytoken);

/**
 * @swagger
 * /user/cart:
 *   get:
 *     summary: Get customer's shopping cart
 *     tags: [Customer Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shopping cart with all items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cart:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                           productName:
 *                             type: string
 *                           price:
 *                             type: number
 *                           quantity:
 *                             type: number
 *                           image:
 *                             type: string
 *                           artisanId:
 *                             type: string
 *                     totalPrice:
 *                       type: number
 *                     itemCount:
 *                       type: number
 *                     createdAt:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  getCart
);

/**
 * @swagger
 * /user/cart:
 *   post:
 *     summary: Add product to cart
 *     tags: [Customer Cart]
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
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID to add to cart
 *               quantity:
 *                 type: number
 *                 description: Quantity to add
 *               price:
 *                 type: number
 *                 description: Product price
 *     responses:
 *       201:
 *         description: Product added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cart:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     items:
 *                       type: array
 *                     totalPrice:
 *                       type: number
 *       400:
 *         description: Invalid product or quantity
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  addToCart
);

/**
 * @swagger
 * /user/cart:
 *   put:
 *     summary: Update or delete items from cart
 *     tags: [Customer Cart]
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
 *                 description: Product ID to update or remove
 *               quantity:
 *                 type: number
 *                 description: New quantity (0 to remove item from cart)
 *               action:
 *                 type: string
 *                 enum: [update, remove]
 *                 description: Action to perform
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cart:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                     totalPrice:
 *                       type: number
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart or product not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/",
  authorizerole("customer", "artisan", "manager", "admin"),
  editCart
);

export default router;

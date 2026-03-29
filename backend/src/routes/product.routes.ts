import express from "express";
import {
  addProduct,
  bulkAddProducts,
  deleteProduct,
  editProduct,
  getAllProducts,
  getProductById,
  getProducts,
  getUserProducts,
  productsModeration,
  updateProductImageController,
  updateRejectionReasonController,
  updateRemovalReasonController,
} from "../controller/productController.js";
import upload from "../middleware/multer.js";
import authorizerole from "../middleware/roleMiddleware.js";
import { verifytoken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes - MUST be before any auth middleware
router.get("/approved", getProducts);
router.get("/public", getProducts);

// Apply auth middleware for all routes below this point
router.use(verifytoken);

// Public routes - accessible by all authenticated users
// router.get(
//   "/approved",
//   authorizerole("customer", "artisan", "manager", "admin"),
//   getProducts
// );

// Artisan+ routes - Must come before /:id to avoid conflicts
/**
 * @swagger
 * /products/my:
 *   get:
 *     summary: Get user's own products (Artisan only)
 *     tags: [Artisan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of artisan's own products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *                   category:
 *                     type: string
 *                   image:
 *                     type: string
 *                   quantity:
 *                     type: number
 *                   status:
 *                     type: string
 *       403:
 *         description: Forbidden - requires artisan role
 */
router.get(
  "/my",
  getUserProducts,
);

// Manager+ routes - all products
/**
 * @swagger
 * /products/all:
 *   get:
 *     summary: Get all products (Manager/Admin only)
 *     tags: [Product Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   category:
 *                     type: string
 *                   image:
 *                     type: string
 *                   quantity:
 *                     type: number
 *                   status:
 *                     type: string
 *                   uploadedBy:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       403:
 *         description: Forbidden - requires manager or admin role
 */
router.get("/all", getAllProducts);

router.get(
  "/:id",
  getProductById,
);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create new product (Manager only)
 *     tags: [Product Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - description
 *               - price
 *               - type
 *               - quantity
 *             properties:
 *               productName:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price
 *               type:
 *                 type: string
 *                 description: Product type/category
 *               material:
 *                 type: string
 *                 description: Product material
 *               quantity:
 *                 type: number
 *                 description: Available quantity
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image file
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - requires manager role
 */
router.post(
  "/",
  upload.single("image"),
  addProduct,
);

/**
 * @swagger
 * /products/bulk:
 *   post:
 *     summary: Bulk create products (Manager only)
 *     tags: [Product Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productName
 *                     - description
 *                     - price
 *                     - type
 *                     - quantity
 *                   properties:
 *                     productName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     type:
 *                       type: string
 *                       description: Product type/category
 *                     material:
 *                       type: string
 *                       description: Optional material
 *                     quantity:
 *                       type: number
 *                     imageUrl:
 *                       type: string
 *                       description: Optional image URL
 *     responses:
 *       201:
 *         description: Products created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - requires manager role
 */
router.post(
  "/bulk",
  bulkAddProducts,
);

// Image update route - MUST come before PUT /:id to avoid conflicts
router.patch(
  "/:id/image",
  upload.single("image"),
  updateProductImageController,
);

// Rejection reason route - MUST come before PUT /:id to avoid conflicts
router.patch(
  "/:id/rejection-reason",
  updateRejectionReasonController,
);

// Removal reason route - MUST come before PUT /:id to avoid conflicts
router.patch(
  "/:id/removal-reason",
  updateRemovalReasonController,
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update an existing product (Artisan only)
 *     tags: [Artisan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       403:
 *         description: Forbidden - requires artisan role
 */
router.put("/:id", editProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (Artisan only)
 *     tags: [Artisan]
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
 *         description: Product deleted successfully
 *       403:
 *         description: Forbidden - requires artisan role
 */
router.delete(
  "/:id",
  deleteProduct,
);

// Manager+ routes
/**
 * @swagger
 * /products/moderation:
 *   post:
 *     summary: Moderate products (approve/reject) (Manager/Admin only)
 *     tags: [Content Moderation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productIds
 *               - action
 *             properties:
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of product IDs to moderate
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Moderation action
 *               reason:
 *                 type: string
 *                 description: Reason for rejection (required if action is reject)
 *     responses:
 *       200:
 *         description: Products moderated successfully
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Forbidden - requires manager or admin role
 */
router.post(
  "/moderation",
  productsModeration,
);

export default router;

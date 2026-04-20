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
 * /products:
 *   get:
 *     summary: Browse and search products (Customer/Public)
 *     tags: [Customer - Browse Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by product category
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name or description
 *       - in: query
 *         name: artisanId
 *         schema:
 *           type: string
 *         description: Filter by artisan ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *         description: Number of products per page
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *           default: 0
 *         description: Number of products to skip
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, popular, lowPrice, highPrice]
 *         description: Sort by option
 *     responses:
 *       200:
 *         description: List of products with filters applied
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
 *                       productName:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       category:
 *                         type: string
 *                       image:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       artisanId:
 *                         type: string
 *                       artisanName:
 *                         type: string
 *                       rating:
 *                         type: number
 *                       reviews:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: number
 *                   description: Total number of products matching filters
 *       400:
 *         description: Invalid filter parameters
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /products/my:
 *   get:
 *     summary: Get artisan's own products
 *     tags: [Artisan Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of artisan's products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   productName:
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
 *                     enum: [approved, pending, rejected]
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       403:
 *         description: Forbidden - requires artisan role
 *       500:
 *         description: Internal server error
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

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product details (Customer view)
 *     tags: [Customer - Browse Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details with artisan info and reviews
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
 *                     productName:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     category:
 *                       type: string
 *                     material:
 *                       type: string
 *                     image:
 *                       type: string
 *                       description: Main product image URL
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Additional product images
 *                     quantity:
 *                       type: number
 *                       description: Available quantity
 *                     artisan:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         businessName:
 *                           type: string
 *                         rating:
 *                           type: number
 *                         followers:
 *                           type: number
 *                     rating:
 *                       type: number
 *                       description: Average product rating (1-5)
 *                     totalReviews:
 *                       type: number
 *                     reviews:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           userName:
 *                             type: string
 *                           rating:
 *                             type: number
 *                           comment:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */

router.get(
  "/:id",
  getProductById,
);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create new product (Artisan/Manager)
 *     tags: [Artisan Products]
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
 *                 description: Detailed product description
 *               price:
 *                 type: number
 *                 description: Product price in USD
 *               type:
 *                 type: string
 *                 description: Product type/category (e.g., jewelry, textiles, pottery)
 *               material:
 *                 type: string
 *                 description: Primary material used
 *               quantity:
 *                 type: number
 *                 description: Available quantity in stock
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image file (JPG, PNG)
 *     responses:
 *       201:
 *         description: Product created successfully
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
 *                     productName:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [approved, pending, rejected]
 *       400:
 *         description: Validation error - missing required fields
 *       403:
 *         description: Forbidden - requires artisan or manager role
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
 *     tags: [Artisan Products]
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
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price
 *               quantity:
 *                 type: number
 *                 description: Available quantity
 *               category:
 *                 type: string
 *                 description: Product category
 *               material:
 *                 type: string
 *                 description: Product material
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 productName:
 *                   type: string
 *                 price:
 *                   type: number
 *                 quantity:
 *                   type: number
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Forbidden - requires artisan role or owner
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", editProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (Artisan only)
 *     tags: [Artisan Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       403:
 *         description: Forbidden - requires artisan role or owner
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
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

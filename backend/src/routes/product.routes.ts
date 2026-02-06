import express from "express";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getProductById,
  getProducts,
  getUserProducts,
  productsModeration,
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
router.get(
  "/my",
  authorizerole("artisan", "manager", "admin"),
  getUserProducts
);

// Manager+ routes - all products
router.get(
  "/all",
  authorizerole("manager", "admin"),
  getAllProducts
);

router.get(
  "/:id",
  authorizerole("customer", "artisan", "manager", "admin"),
  getProductById
);

router.post(
  "/",
  authorizerole("artisan", "manager", "admin"),
  upload.single("image"),
  addProduct
);

router.put("/:id", authorizerole("artisan", "manager", "admin"), editProduct);

router.delete(
  "/:id",
  authorizerole("artisan", "manager", "admin"),
  deleteProduct
);

// Manager+ routes
router.post(
  "/moderation",
  authorizerole("manager", "admin"),
  productsModeration
);

export default router;

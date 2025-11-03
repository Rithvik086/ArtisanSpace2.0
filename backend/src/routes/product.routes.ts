import express from "express";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getAllProducts,
  getProducts,
  getUserProducts,
  productsModeration,
} from "../controller/productController.js";
import upload from "../middleware/multer.js";
import authorizerole from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public routes - accessible by all authenticated users
router.get(
  "/approved",
  authorizerole("customer", "artisan", "manager", "admin"),
  getProducts
);

// Artisan+ routes
router.get(
  "/my",
  authorizerole("artisan", "manager", "admin"),
  getUserProducts
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

router.get("/all", authorizerole("manager", "admin"), getAllProducts);

export default router;

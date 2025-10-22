import express from "express";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getProducts,
} from "../controller/productController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/", getProducts);

router.post("/", upload.single("image"), addProduct);

router.put("/:id", editProduct);

router.delete("/:id", deleteProduct);

export default router;

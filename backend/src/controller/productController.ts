import type { Request, Response } from "express";
import {
  addProductService,
  approveProduct,
  deleteProductService,
  disapproveProduct,
  getApprovedProducts,
  getProductById as getProductByIdService,
  getProducts as getProductsService,
  updateProduct,
} from "../services/productServices.js";
import cloudinary from "../config/cloudinary.js";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, material } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    let categoryParam: string | string[] | null = null;
    if (typeof category === "string") {
      categoryParam = category;
    } else if (Array.isArray(category)) {
      categoryParam = category.filter(
        (item): item is string => typeof item === "string"
      );
    }

    let materialParam: string | string[] | null = null;
    if (typeof material === "string") {
      materialParam = material;
    } else if (Array.isArray(material)) {
      materialParam = material.filter(
        (item): item is string => typeof item === "string"
      );
    }

    const result = await getApprovedProducts(
      categoryParam,
      materialParam,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      products: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    throw new Error("Error loading store page: " + (error as Error).message);
  }
};

export const editProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const { name, oldPrice, newPrice, quantity, description } = req.body;

    const result = await updateProduct(
      productId as string,
      name,
      parseInt(oldPrice),
      parseInt(newPrice),
      parseInt(quantity),
      description
    );

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json({ success: false });
    }
  } catch (e) {
    throw new Error("Error editing product: " + (e as Error).message);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const result = await deleteProductService(productId as string);
    if (result.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false });
    }
  } catch (error) {
    throw new Error("Error deleting product: " + (error as Error).message);
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    const { productName, type, material, price, description, quantity } =
      req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    await addProductService(
      req.user.id,
      req.user.role,
      productName,
      type,
      material,
      result.secure_url,
      price,
      quantity,
      description
    );

    res.status(201).json({ message: "Product added successfully" });
  } catch (error) {
    throw new Error("Error adding product: " + (error as Error).message);
  }
};

export const productsModeration = async (req: Request, res: Response) => {
  try {
    // Accept parameters from either query string or JSON body
    const actionRaw =
      (req.query.action as string) || (req.body && req.body.action);
    const productIdRaw =
      (req.query.productId as string) || (req.body && req.body.productId);

    const action =
      typeof actionRaw === "string" ? actionRaw.trim().toLowerCase() : "";
    const productId =
      typeof productIdRaw === "string" ? productIdRaw.trim() : "";

    if (!action)
      return res
        .status(400)
        .json({ success: false, error: "Missing action parameter" });
    if (!productId)
      return res
        .status(400)
        .json({ success: false, error: "Missing productId parameter" });

    let result = { success: false };

    if (action === "approve") {
      result = await approveProduct(productId);
    } else if (action === "disapprove") {
      result = await disapproveProduct(productId);
    } else if (action === "remove") {
      result = await deleteProductService(productId);
    } else {
      return res.status(400).json({ success: false, error: "Invalid action" });
    }

    if (result && result.success) {
      return res.status(200).json({ success: true });
    }

    // If service returned falsy success, return 500 with optional message
    return res
      .status(500)
      .json({ success: false, error: "Moderation action failed" });
  } catch (e) {
    console.error("Error in productsModeration:", (e as Error).message);
    return res
      .status(500)
      .json({ success: false, error: (e as Error).message || "Server error" });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const result = await getProductsService(null, false, page, limit);
    res.status(200).json({
      success: true,
      products: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    throw new Error("Error fetching all products: " + (error as Error).message);
  }
};

export const getUserProducts = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const result = await getProductsService(userId, false, page, limit);
    res.status(200).json({
      success: true,
      products: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    throw new Error(
      "Error fetching user products: " + (error as Error).message
    );
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, error: "Product ID is required" });
    }
    const product = await getProductByIdService(productId);
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(404).json({ success: false, error: (error as Error).message });
  }
};

import type { Request, Response } from "express";
import {
  addProductService,
  approveProduct,
  deleteProductService,
  disapproveProduct,
  getApprovedProducts,
  getProducts as getProductsService,
  updateProduct,
} from "../services/productServices.js";
import cloudinary from "../config/cloudinary.js";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
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

    const result = await getApprovedProducts(categoryParam, page, limit);

    res.status(200).json({
      success: true,
      products: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
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
    const { action, productId } = req.query;
    let msg = { success: false };

    if (action === "approve") {
      msg = await approveProduct(productId as string);
    } else if (action === "disapprove") {
      msg = await disapproveProduct(productId as string);
    } else if (action === "remove") {
      msg = await deleteProductService(productId as string);
    } else {
      return res.status(400).json({ success: false, error: "Invalid action" });
    }
    if (msg.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false });
    }
  } catch (e) {
    throw new Error("Error in product moderation: " + (e as Error).message);
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
    throw new Error(
      "Error fetching all products: " + (error as Error).message
    );
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

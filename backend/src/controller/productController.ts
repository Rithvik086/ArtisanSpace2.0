import type { Request, Response } from "express";
import { getApprovedProducts } from "../services/productServices.js";

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
